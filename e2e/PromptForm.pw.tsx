import { test, expect, Page } from '@playwright/test';
import { Prompt, Category } from '../src/types'; // Adjust path as necessary

const mockCategories: Category[] = [
  { id: 'cat1', name: 'General', userId: 'user1', createdAt: '', updatedAt: '' },
  { id: 'cat2', name: 'Coding', userId: 'user1', createdAt: '', updatedAt: '' },
  { id: 'cat3', name: 'Writing', userId: 'user1', createdAt: '', updatedAt: '' },
];

const initialEditPrompt: Prompt = {
  id: 'prompt-edit-1',
  name: 'Edit Me',
  content: 'Initial content for editing',
  categoryId: 'cat2', // Belongs to "Coding"
  userId: 'user1',
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

async function openNewForm(page: Page) {
  await page.goto('/test-prompt-form');
  await page.evaluate(() => window.resetTestState());
  await page.getByTestId('open-new-form-button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function openEditForm(page: Page, promptData: Prompt) {
  await page.goto('/test-prompt-form');
  // The test page's button 'open-edit-form-button' uses its own hardcoded initial data.
  // To use specific data for this test, we call window.openDialog directly.
  await page.evaluate((data) => {
    window.resetTestState();
    window.openDialog(data);
  }, promptData);
  await expect(page.getByRole('dialog')).toBeVisible();
}

test.describe('PromptForm Component - E2E', () => {
  test('renders with "Create New Prompt" title and empty fields for new prompt', async ({ page }) => {
    await openNewForm(page);
    await expect(page.getByRole('heading', { name: 'Create New Prompt' })).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveValue('');
    await expect(page.getByLabel('Category Name')).toHaveValue('');
    await expect(page.getByLabel('Content')).toHaveValue('');
  });

  test('renders with "Edit Prompt" title and populated fields for initialData', async ({ page }) => {
    await openEditForm(page, initialEditPrompt);
    await expect(page.getByRole('heading', { name: 'Edit Prompt' })).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveValue(initialEditPrompt.name);
    await expect(page.getByLabel('Content')).toHaveValue(initialEditPrompt.content);
    
    const expectedCategoryName = mockCategories.find(c => c.id === initialEditPrompt.categoryId)?.name || '';
    await expect(page.getByLabel('Category Name')).toHaveValue(expectedCategoryName);
  });

  test('fields are empty when reopened for a new prompt after editing', async ({ page }) => {
    await openEditForm(page, initialEditPrompt);
    await expect(page.getByLabel('Name')).toHaveValue(initialEditPrompt.name);
    // Close the dialog
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Reopen for new prompt
    await page.getByTestId('open-new-form-button').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create New Prompt' })).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveValue('');
    await expect(page.getByLabel('Category Name')).toHaveValue('');
    await expect(page.getByLabel('Content')).toHaveValue('');
  });

  test('allows typing into Name, Category, and Content fields', async ({ page }) => {
    await openNewForm(page);
    const testData = {
      name: 'My Prompt Name',
      category: 'Test Category Input',
      content: 'This is the prompt content entered by the user.',
    };
    await page.getByLabel('Name').fill(testData.name);
    await page.getByLabel('Category Name').fill(testData.category);
    await page.getByLabel('Content').fill(testData.content);

    await expect(page.getByLabel('Name')).toHaveValue(testData.name);
    await expect(page.getByLabel('Category Name')).toHaveValue(testData.category);
    await expect(page.getByLabel('Content')).toHaveValue(testData.content);
  });

  test('calls onClose when Cancel button is clicked', async ({ page }) => {
    await openNewForm(page);
    await page.getByRole('button', { name: 'Cancel' }).click();
    const onCloseCalled = await page.evaluate(() => window.onCloseCalled);
    expect(onCloseCalled).toBe(true);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('calls onClose when X button is clicked', async ({ page }) => {
    await openNewForm(page);
    await page.locator('button[aria-label="Close"]').click(); // Standard Shadcn/Radix close button
    const onCloseCalled = await page.evaluate(() => window.onCloseCalled);
    expect(onCloseCalled).toBe(true);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test.describe('Form Submission', () => {
    const validInputs = {
      name: 'Valid Name',
      categoryName: 'Valid Category',
      content: 'Valid Content',
    };

    test('calls onSubmit with correct data for valid inputs', async ({ page }) => {
      await openNewForm(page);
      await page.getByLabel('Name').fill(validInputs.name);
      await page.getByLabel('Category Name').fill(validInputs.categoryName);
      await page.getByLabel('Content').fill(validInputs.content);
      
      await page.getByRole('button', { name: 'Save Prompt' }).click();

      const onSubmitArgs = await page.evaluate(() => window.onSubmitCalledWith);
      expect(onSubmitArgs).not.toBeNull();
      expect(onSubmitArgs?.promptData.name).toBe(validInputs.name);
      expect(onSubmitArgs?.promptData.content).toBe(validInputs.content);
      expect(onSubmitArgs?.promptData.categoryId).toBe(''); // As per component logic
      expect(onSubmitArgs?.categoryName).toBe(validInputs.categoryName);
      
      // Check if dialog closes (depends on test page's onSubmit) - current test page does not auto-close.
      // await expect(page.getByRole('dialog')).not.toBeVisible(); 
    });
    
    const requiredFields = ['Name', 'Category Name', 'Content'];
    for (const field of requiredFields) {
      test(`shows alert and does not call onSubmit if ${field} is empty`, async ({ page }) => {
        await openNewForm(page);
        
        // Setup alert listener
        let alertMessage = '';
        page.on('dialog', async (dialog) => {
          alertMessage = dialog.message();
          await dialog.dismiss(); // or dialog.accept()
        });

        // Fill other fields but leave current one empty
        if (field !== 'Name') await page.getByLabel('Name').fill('Some Name');
        if (field !== 'Category Name') await page.getByLabel('Category Name').fill('Some Category');
        if (field !== 'Content') await page.getByLabel('Content').fill('Some Content');
        
        await page.getByRole('button', { name: 'Save Prompt' }).click();

        expect(alertMessage).toContain(`${field} cannot be empty`);
        const onSubmitArgs = await page.evaluate(() => window.onSubmitCalledWith);
        expect(onSubmitArgs).toBeNull();
        await expect(page.getByRole('dialog')).toBeVisible(); // Dialog should remain open
      });
    }
  });
});
