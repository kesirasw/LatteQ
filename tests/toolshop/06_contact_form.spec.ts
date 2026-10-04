import fs from 'fs';
import { test, expect } from '../../fixtures/test';
import { ToolshopData, ToolshopMessages } from '../../data/toolshop-data';

// Plan: test-plans/toolshop/test-cases/06-contact-form.md

const details = {
  firstName: 'Latte',
  lastName: 'Tester',
  email: 'latteq.contact@example.com',
  subject: ToolshopData.contactSubject,
  message: ToolshopData.contactMessage,
};

test.describe('Toolshop: contact form', () => {
  test.beforeEach(async ({ toolshopContact }) => {
    await toolshopContact.open();
  });

  test("TC-CON-01 Toolshop: sending an empty form shows what's required", async ({ toolshopContact }) => {
    await toolshopContact.send();

    for (const field of ['First name', 'Last name', 'Email', 'Subject', 'Message']) {
      await expect(toolshopContact.notice(`${field} is required`)).toBeVisible();
    }
    await expect(toolshopContact.notice(ToolshopMessages.contactThanks)).toBeHidden();
  });

  test('TC-CON-02 Toolshop: only empty text files can be attached', async ({ toolshopContact }, testInfo) => {
    const file = testInfo.outputPath('not-empty.txt');
    fs.writeFileSync(file, 'This file is not empty, so the shop should refuse it.');

    await toolshopContact.fill(details);
    await toolshopContact.attach(file);
    await toolshopContact.send();

    await expect(toolshopContact.notice(ToolshopMessages.attachmentNotEmpty)).toBeVisible();
    await expect(toolshopContact.notice(ToolshopMessages.contactThanks)).toBeHidden();
  });

  test('TC-CON-03 Toolshop: sending a complete message', async ({ toolshopContact }) => {
    await toolshopContact.fill(details);
    await toolshopContact.send();

    await expect(toolshopContact.notice(ToolshopMessages.contactThanks)).toBeVisible();
  });
});
