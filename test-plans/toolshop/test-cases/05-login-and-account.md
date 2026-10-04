# Login and account — Practice Software Testing (Toolshop)

Part of the [Toolshop test plan](../test-plan.md).

**What this covers:** Signing in and out, creating an account, resetting a password, and the customer's account area.

| ID | Title | Priority | Basis |
|---|---|---|---|
| TC-AUT-01 | Signing in as a customer | High | Seen during exploration |
| TC-AUT-02 | Sign-in needs an email address | Medium | Seen during exploration |
| TC-AUT-03 | Signing in with a wrong password | Medium | Needs confirming |
| TC-AUT-04 | Registration explains the password rules | Medium | Seen during exploration |
| TC-AUT-05 | Registering a new customer | Medium | Needs confirming |
| TC-AUT-06 | A weak password is refused | Low | Needs confirming |
| TC-AUT-07 | Asking for a new password | Low | Needs confirming |
| TC-AUT-08 | Signing out | Medium | Needs confirming |

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
- **Expected result:** A message says the email or password is incorrect, and you aren't signed in.
- **Basis:** Needs confirming
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
- **Expected result:** The account is created, and you're taken to the sign-in page (or signed straight in). Signing in with the new details works.
- **Basis:** Needs confirming
- **Map reference:** R1
- **Notes:** Use a new email address each time. This creates a real account on the shared demo.

### TC-AUT-06 — A weak password is refused

- **Priority:** Low
- **Type:** Validation
- **Before you start:** On the registration page.
- **Steps:**
  1. Fill in every field, but use **abc** as the password.
  2. Click **Register**.
- **Expected result:** The password is marked **Weak**, the unmet rules are pointed out, and no account is created.
- **Basis:** Needs confirming
- **Map reference:** R1

### TC-AUT-07 — Asking for a new password

- **Priority:** Low
- **Type:** Functional
- **Before you start:** Not signed in.
- **Steps:**
  1. On the sign-in page, click **Forgot your Password?**.
  2. Enter a demo customer's email address.
  3. Click **Set New Password**.
- **Expected result:** A message confirms that the request was received.
- **Basis:** Needs confirming
- **Map reference:** R2

### TC-AUT-08 — Signing out

- **Priority:** Medium
- **Type:** Functional
- **Before you start:** Signed in as a demo customer.
- **Steps:**
  1. Open the menu with the customer's name.
  2. Choose the sign-out option.
- **Expected result:** The top menu shows **Sign in** again, and opening **My account** asks you to sign in.
- **Basis:** Needs confirming
- **Map reference:** A2
