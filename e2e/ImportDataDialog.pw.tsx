import { test, expect, Page } from '@playwright/test';
import path from 'path';

// Helper function to interact with the test page
async function setupDialog(page: Page) {
  await page.goto('/test-import-dialog');
  // Ensure window functions are available and reset state before each test interaction
  await page.evaluate(() => window.resetTestState());
  // Open the dialog using the button on the test page
  await page.getByTestId('open-dialog-button').click();
  // Wait for dialog to be visible (optional, but good practice)
  await expect(page.getByRole('dialog')).toBeVisible();
}

test.describe('ImportDataDialog Component - E2E', () => {
  test('renders correctly when isOpen is true', async ({ page }) => {
    await setupDialog(page);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Import Data' })).toBeVisible();
    await expect(page.getByPlaceholder('Paste your JSON data here...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Import' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.locator('button[aria-label="Close"]')).toBeVisible(); // DialogClose X button
  });

  test('dialog does not render when isOpen is false (after being closed)', async ({ page }) => {
    await setupDialog(page); // Opens dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click cancel button to close
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    const onCloseCalled = await page.evaluate(() => window.onCloseCalled);
    expect(onCloseCalled).toBe(true);
  });

  test('allows user to input JSON data into the textarea', async ({ page }) => {
    await setupDialog(page);
    const jsonData = '{"key": "value", "number": 123}';
    await page.getByPlaceholder('Paste your JSON data here...').fill(jsonData);
    await expect(page.getByPlaceholder('Paste your JSON data here...')).toHaveValue(jsonData);
  });

  test('calls onClose when the Cancel button is clicked', async ({ page }) => {
    await setupDialog(page);
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    const onCloseCalled = await page.evaluate(() => window.onCloseCalled);
    expect(onCloseCalled).toBe(true);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('calls onClose when the X (close) button is clicked', async ({ page }) => {
    await setupDialog(page);
    // The close button is part of DialogClose which wraps a Button, often just an X icon.
    // Shadcn UI Dialog typically has a button with an X icon inside.
    // Let's assume it's findable by its aria-label or a more specific selector if needed.
    // The component uses <DialogClose asChild> which might mean the actual button has the X.
    // The default Radix/Shadcn close button has an aria-label="Close".
    await page.locator('button[aria-label="Close"]').click();
    
    const onCloseCalled = await page.evaluate(() => window.onCloseCalled);
    expect(onCloseCalled).toBe(true);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test.describe('Import Functionality', () => {
    const validJson = '{"message": "This is valid JSON"}';
    const emptyJson = '';
    const whitespaceJson = '   \n   ';

    test('Import button is disabled if textarea is empty', async ({ page }) => {
      await setupDialog(page);
      await page.getByPlaceholder('Paste your JSON data here...').fill(emptyJson);
      await expect(page.getByRole('button', { name: 'Import' })).toBeDisabled();
    });

    test('Import button is disabled if textarea contains only whitespace', async ({ page }) => {
      await setupDialog(page);
      await page.getByPlaceholder('Paste your JSON data here...').fill(whitespaceJson);
      await expect(page.getByRole('button', { name: 'Import' })).toBeDisabled();
    });

    test('calls onImport with textarea content when Import button is clicked with valid JSON', async ({ page }) => {
      await setupDialog(page);
      await page.getByPlaceholder('Paste your JSON data here...').fill(validJson);
      await expect(page.getByRole('button', { name: 'Import' })).toBeEnabled();
      await page.getByRole('button', { name: 'Import' }).click();

      const onImportArg = await page.evaluate(() => window.onImportCalledWith);
      expect(onImportArg).toBe(validJson);
      
      // Dialog does not close itself by default, parent should call onClose.
      // This test verifies onImport is called. Test below checks if parent closes.
      await expect(page.getByRole('dialog')).toBeVisible(); 
    });

    test('dialog closes after successful import (if parent calls onClose)', async ({ page }) => {
      await page.goto('/test-import-dialog');
      await page.evaluate(() => {
        window.resetTestState();
        // Modify onImport on the test page to also call closeDialog for this specific test
        const originalOnImport = window.onImport; // Assuming onImport is directly on window for this, or adapt test page
        window.onImport = (jsonData: string) => {
          if (originalOnImport) originalOnImport(jsonData); // Call original logic from test page (sets window.onImportCalledWith)
          window.closeDialog(); // Simulate parent closing dialog
        };
      });
      
      // Open the dialog using the button on the test page
      await page.getByTestId('open-dialog-button').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.evaluate(() => window.resetTestState()); // Reset after open, before action

      await page.getByPlaceholder('Paste your JSON data here...').fill(validJson);
      await page.getByRole('button', { name: 'Import' }).click();

      const onImportArg = await page.evaluate(() => window.onImportCalledWith);
      expect(onImportArg).toBe(validJson);

      // Wait for dialog to not be visible due to the modified onImport handler
      await expect(page.getByRole('dialog')).not.toBeVisible();
      const onCloseCalled = await page.evaluate(() => window.onCloseCalled);
      expect(onCloseCalled).toBe(true);
    });

    test('selecting a JSON file populates the textarea', async ({ page }) => {
      await setupDialog(page);
      const testFilePath = 'e2e/fixtures/test-data.json'; // Needs this file to exist
      const fileContent = '{"name": "Test Data", "version": 1.0}';

      // Create a dummy file for upload in the context of the test execution
      // Playwright's setInputFiles needs a path to an actual file.
      // We can't create files directly in the 'e2e' source during test runtime easily.
      // Instead, we'll use a Buffer.
      await page.getByLabel('Upload File').setInputFiles({
        name: 'test-data.json',
        mimeType: 'application/json',
        buffer: Buffer.from(fileContent)
      });

      await expect(page.getByPlaceholder('Paste your JSON data here...')).toHaveValue(fileContent);
    });
  });
});
