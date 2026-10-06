# Contact form — Practice Software Testing (Toolshop)

Part of the [Toolshop test plan](../test-plan.md).

**What this covers:** The **Contact** page: required fields, the attachment rule, and sending a message.

| ID | Title | Priority | Basis |
|---|---|---|---|
| TC-CON-01 | Sending an empty form shows what's required | Medium | Seen during exploration |
| TC-CON-02 | Only empty text files can be attached | Low | Confirmed by run |
| TC-CON-03 | Sending a complete message | Medium | Confirmed by run |

---

### TC-CON-01 — Sending an empty form shows what's required

- **Priority:** Medium
- **Type:** Validation
- **Before you start:** On the **Contact** page.
- **Steps:**
  1. Click **Send** without filling in anything.
- **Expected result:** Five messages appear: **First name is required**, **Last name is required**, **Email is required**, **Subject is required** and **Message is required**. Nothing is sent.
- **Basis:** Seen during exploration
- **Map reference:** F1

### TC-CON-02 — Only empty text files can be attached

- **Priority:** Low
- **Type:** Validation
- **Before you start:** On the **Contact** page.
- **Steps:**
  1. Fill in every field.
  2. Attach a picture, or a text file that has content in it.
  3. Click **Send**.
- **Expected result:** The message **File should be empty.** appears, and the message isn't sent. This matches the rule shown on the page: "Only files with the txt extension are allowed, and files must be 0kb."
- **Basis:** Confirmed by automated run (2026-10-05)
- **Map reference:** F1
- **Notes:** Confirmed by the automated run on 2026-10-05. Tested with a text file that has content.

### TC-CON-03 — Sending a complete message

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** On the **Contact** page.
- **Steps:**
  1. Fill in **First name**, **Last name** and **Email address**.
  2. Choose **Customer service** as the **Subject**.
  3. Write a message.
  4. Click **Send**.
- **Expected result:** The message **Thanks for your message! We will contact you shortly.** appears.
- **Basis:** Confirmed by automated run (2026-10-05)
- **Map reference:** F1
