# Login and account — Practice Software Testing (Toolshop)

Part of the [Toolshop test plan](../test-plan.md).

**What this covers:** Signing in and out, creating an account, resetting a password, and the customer's account area.

| ID | Title | Priority | Basis |
|---|---|---|---|
| TC-AUT-01 | Signing in as a customer | High | Seen during exploration |
| TC-AUT-02 | Sign-in needs an email address | Medium | Seen during exploration |
| TC-AUT-03 | Signing in with a wrong password | Medium | Confirmed by run |
| TC-AUT-04 | Registration explains the password rules | Medium | Seen during exploration |
| TC-AUT-05 | Registering a new customer | Medium | Confirmed by run |
| TC-AUT-06 | A weak password is refused | Low | Confirmed by run |
| TC-AUT-07 | Asking for a new password | Low | Confirmed by run (suspected defect) |
| TC-AUT-08 | Signing out | Medium | Confirmed by run |

---

### TC-AUT-01 — Signing in as a customer

- **Priority:** High
- **Type:** Functional
- **Before you start:** Not signed in.
- **Steps:**
  1. Click **Sign in** in the top menu.
  2. Enter a demo customer's email address and password.
  3. Click **Login**.
- **Expected result:** The **My account** page opens with links to **Favorites**, **Profile**, **Invoices** and **Messages**, and the top menu shows the customer's name.
- **Basis:** Seen during exploration
- **Map reference:** A2

### TC-AUT-02 — Sign-in needs an email address

- **Priority:** Medium
- **Type:** Validation
- **Before you start:** Not signed in. On the sign-in page.
- **Steps:**
  1. Leave **Email address** empty and enter any password.
  2. Click **Login**.
- **Expected result:** The message **Email is required** appears under the email field, and you stay on the sign-in page.
- **Basis:** Seen during exploration
- **Map reference:** A1

### TC-AUT-03 — Signing in with a wrong password

- **Priority:** Medium
- **Type:** Negative
- **Before you start:** Not signed in. On the sign-in page.
- **Steps:**
  1. Enter a demo customer's email address with a wrong password.
  2. Click **Login**.
- **Expected result:** The message **Invalid email or password** appears, and you aren't signed in.
- **Basis:** Confirmed by automated run (2026-10-05)
- **Map reference:** A1

### TC-AUT-04 — Registration explains the password rules

- **Priority:** Medium
- **Type:** Validation
- **Before you start:** Not signed in.
- **Steps:**
  1. Open the **Customer registration** page (the **Register your account** link on the sign-in page).
- **Expected result:** The form lists the password rules: at least 8 characters, both upper- and lower-case letters, at least one number, and at least one special symbol. It also shows a password strength scale from **Weak** to **Very Strong**.
- **Basis:** Seen during exploration
- **Map reference:** R1

### TC-AUT-05 — Registering a new customer

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** Not signed in. Have an email address that has never been registered.
- **Steps:**
  1. Open the registration page.
  2. Fill in every field, using a password that meets all the rules.
  3. Click **Register**.
- **Expected result:** The account is created and you're taken to the sign-in page. Signing in with the new details opens **My account**.
- **Basis:** Confirmed by automated run (2026-10-05)
- **Map reference:** R1
- **Notes:** Use a new email address each time. This creates a real account on the shared demo.

### TC-AUT-06 — A weak password is refused

- **Priority:** Low
- **Type:** Validation
- **Before you start:** On the registration page.
- **Steps:**
  1. Fill in every field, but use **abc** as the password.
  2. Click **Register**.
- **Expected result:** No account is created, you stay on the registration page, and the message **Password must be minimal 6 characters long.** appears.
- **Notes:** Inconsistency: the page's own rules say *at least 8 characters*, but the error says *6*. It also says "Password can not include invalid characters." for "abc" (plan, section 9).
- **Basis:** Confirmed by automated run (2026-10-05)
- **Map reference:** R1

### TC-AUT-07 — Asking for a new password

- **Priority:** Low
- **Type:** Functional
- **Before you start:** Not signed in.
- **Steps:**
  1. On the sign-in page, click **Forgot your Password?**.
  2. Enter a demo customer's email address.
  3. Click **Set New Password**.
- **Expected result:** A readable message confirms that the request was received.
- **Notes:** Suspected defect: the page shows the untranslated text **page.forgot-password.confirm** instead of a message (plan, section 9).
- **Basis:** Confirmed by automated run (2026-10-05): suspected defect
- **Map reference:** R2

### TC-AUT-08 — Signing out

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** Signed in as a demo customer.
- **Steps:**
  1. Open the menu with the customer's name.
  2. Choose the sign-out option.
- **Expected result:** The top menu shows **Sign in** again, and opening **My account** asks you to sign in.
- **Basis:** Confirmed by automated run (2026-10-05)
- **Map reference:** A2
