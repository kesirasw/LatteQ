# Users and login — Toolshop API

Part of the [Toolshop API test plan](../test-plan.md).

**What this covers:** Registering a customer, logging in and out, renewing the access key, changing and resetting a password, reading and changing a customer's own details, and making sure a customer can't see or change anyone else's account. Admin-only user management is out of scope (see the plan, section 2).

| Operation | Endpoint | Auth |
|---|---|---|
| Register | `POST /users/register` | No |
| Log in | `POST /users/login` | No |
| Read my profile | `GET /users/me` | Yes |
| Renew the access key | `GET /users/refresh` | Yes |
| Log out | `GET /users/logout` | Yes |
| Change password | `POST /users/change-password` | Yes |
| Ask for a password reset | `POST /users/forgot-password` | No |
| Read a user | `GET /users/{userId}` | Yes |
| Replace a user's details | `PUT /users/{userId}` | Yes |
| Change some of a user's details | `PATCH /users/{userId}` | Yes |
| Delete a user | `DELETE /users/{userId}` | Yes |
| List all users | `GET /users` | Yes |
| Search users | `GET /users/search` | Yes |

| ID | Title | Priority | Basis |
|---|---|---|---|
| API-USR-01 | Registering a new customer | High | Documented in contract |
| API-USR-02 | Registering with an email address already in use is refused | High | Documented in contract |
| API-USR-03 | Registering with an empty request is refused | Medium | Seen in live response |
| API-USR-04 | Registering without each required detail is refused | Medium | Seen in live response |
| API-USR-05 | Registering with the wrong kind of value is refused | Medium | Seen in live response |
| API-USR-06 | Registering with names that are too long is refused | Low | Documented in contract |
| API-USR-07 | Registering with a weak password is refused | Medium | Documented in contract |
| API-USR-08 | Registering someone outside the allowed age range is refused | Medium | Documented in contract |
| API-USR-09 | Registering with a badly formed email address is refused | Medium | Documented in contract |
| API-USR-10 | Logging in with the right details | High | Documented in contract |
| API-USR-11 | Logging in with a wrong password or unknown email is refused | High | Seen in live response |
| API-USR-12 | Logging in with details missing is refused | Medium | Seen in live response |
| API-USR-13 | Reading my own profile | High | Documented in contract |
| API-USR-14 | Renewing the access key | Medium | Documented in contract |
| API-USR-15 | Logging out ends the session | High | Documented in contract |
| API-USR-16 | Changing my password | Medium | Documented in contract |
| API-USR-17 | Changing my password with the wrong current password is refused | Medium | Seen in live response |
| API-USR-18 | Changing my password with a mismatched confirmation is refused | Low | Seen in live response |
| API-USR-19 | Asking for a password reset for a registered email | Medium | Documented in contract |
| API-USR-20 | Asking for a password reset for an unknown email is refused | Low | Seen in live response |
| API-USR-21 | Asking for a password reset without an email is refused | Low | Documented in contract |
| API-USR-22 | Reading my own user record | Medium | Documented in contract |
| API-USR-23 | A customer can't read another customer's record | High | Documented in contract |
| API-USR-24 | Reading a user that doesn't exist, or with a badly formed ID | Low | Documented in contract |
| API-USR-25 | Changing some of my details | Medium | Documented in contract |
| API-USR-26 | Replacing my details | Medium | Documented in contract |
| API-USR-27 | Changing my details to invalid values is refused | Medium | Seen in live response |
| API-USR-28 | A customer can't change another customer's details | High | Documented in contract |
| API-USR-29 | Changing my email to one another customer uses is refused | High | Documented in contract |
| API-USR-30 | A customer can't delete another account | Medium | Documented in contract |
| API-USR-31 | A customer can't list all users | Medium | Seen in live response |
| API-USR-32 | A customer can't search other customers' details | High | Needs confirming |
| API-USR-33 | Account operations refuse requests without a valid access key | High | Documented in contract |
| API-USR-34 | Renewing the access key without one is refused | Medium | Documented in contract |
| API-USR-35 | Unsupported methods on user addresses are refused | Low | Documented in contract |

---

### API-USR-01 — Registering a new customer

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `POST /users/register`
- **Before you start:** Nothing. Make up a new, unique email address.
- **Request:** Send a registration with first name, last name, a unique email address, a strong password, a date of birth (adult), a phone number and an Austrian address.
- **Expected response:** **201 Created**. The response has the documented customer details: the same names, email, date of birth, phone and address that were sent, plus a new customer ID and creation date. The password is never returned.
- **Basis:** Documented in contract
- **Changes data:** Yes — creates a throwaway customer. Clean up: not possible as a customer (deleting accounts needs the admin account), so the email address is unique and clearly marked as a test address.
- **Contract reference:** `POST /users/register`: documented responses 201, 400, 401, 403, 409

### API-USR-02 — Registering with an email address already in use is refused

- **Priority:** High
- **Type:** Business rule
- **Endpoint:** `POST /users/register`
- **Before you start:** Register a customer (as in API-USR-01).
- **Request:** Send a second registration with exactly the same details.
- **Expected response:** **409 Conflict**. The service explains that a customer with this email address already exists, and no second account is created.
- **Basis:** Documented in contract (the 409 and its field-level body); message seen in live response
- **Changes data:** Yes — the first registration creates a throwaway customer (see API-USR-01).
- **Contract reference:** `POST /users/register`: 409 (DuplicateConflictResponse)

### API-USR-03 — Registering with an empty request is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /users/register`
- **Before you start:** Nothing.
- **Request:** Send a registration with no details at all.
- **Expected response:** **422 Unprocessable Entity**. The service lists every required detail as missing: first name, last name, email and password.
- **Basis:** Seen in live response (the contract documents **400 Bad Request** here; see finding 10)
- **Changes data:** No
- **Contract reference:** `POST /users/register`: documented responses 201, 400, 401, 403, 409

### API-USR-04 — Registering without each required detail is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /users/register`
- **Before you start:** Nothing.
- **Request:** Send a complete, valid registration, leaving out one required detail at a time.
- **Variations:**

  | Left out |
  |---|
  | first name (first_name) |
  | last name (last_name) |
  | email (email) |
  | password (password) |

- **Expected response:** **422 Unprocessable Entity** for each, naming only the missing detail. No account is created.
- **Basis:** Seen in live response (contract documents 400; see finding 10)
- **Changes data:** No
- **Contract reference:** `UserRequest`: required first_name, last_name, email, password

### API-USR-05 — Registering with the wrong kind of value is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /users/register`
- **Before you start:** Nothing.
- **Request:** Send a valid registration where one detail is a number or a yes/no value instead of text.
- **Variations:**

  | Detail | Value sent |
  |---|---|
  | first name | a number |
  | last name | a yes/no value |
  | email | a number |
  | password | a number |

- **Expected response:** **422 Unprocessable Entity** for each, saying that detail must be text.
- **Basis:** Seen in live response
- **Changes data:** No
- **Contract reference:** `UserRequest`: all four are text

### API-USR-06 — Registering with names that are too long is refused

- **Priority:** Low
- **Type:** Validation
- **Endpoint:** `POST /users/register`
- **Before you start:** Nothing.
- **Request:** Send a valid registration with one name one character longer than allowed.
- **Variations:**

  | Detail | Length sent | Allowed |
  |---|---|---|
  | first name | 41 characters | 40 |
  | last name | 21 characters | 20 |

- **Expected response:** **422 Unprocessable Entity**, saying the name must not be longer than the limit.
- **Basis:** Documented in contract (maximum lengths); message seen in live response
- **Changes data:** No
- **Contract reference:** `UserRequest`: first_name up to 40, last_name up to 20 characters

### API-USR-07 — Registering with a weak password is refused

- **Priority:** Medium
- **Type:** Business rule
- **Endpoint:** `POST /users/register`
- **Before you start:** Nothing.
- **Request:** Send a valid registration with a password that breaks one rule at a time.
- **Variations:**

  | Password | Rule broken |
  |---|---|
  | 7 characters, otherwise strong | at least 8 characters |
  | no capital letter | needs upper and lower case |
  | no small letter | needs upper and lower case |
  | no digit | needs a number |
  | no symbol | needs a symbol |

- **Expected response:** **422 Unprocessable Entity** for each, with a password message naming the broken rule.
- **Basis:** Documented in contract (password description: at least 8 characters, upper case, lower case, number and symbol)
- **Changes data:** No
- **Contract reference:** `UserRequest.password`

### API-USR-08 — Registering someone outside the allowed age range is refused

- **Priority:** Medium
- **Type:** Business rule
- **Endpoint:** `POST /users/register`
- **Before you start:** Nothing.
- **Request:** Send a valid registration with a date of birth outside the allowed range.
- **Variations:**

  | Date of birth |
  |---|
  | 10 years ago (too young) |
  | 80 years ago (too old) |

- **Expected response:** **422 Unprocessable Entity**, with a message about the date of birth.
- **Basis:** Documented in contract ("must be a valid date between 18 and 75 years ago"); the under-18 message was seen live
- **Changes data:** No (if refused)
- **Contract reference:** `UserRequest.dob`
- **Notes:** Live, someone 80 years old is registered (**201 Created**). See finding 13.

### API-USR-09 — Registering with a badly formed email address is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /users/register`
- **Before you start:** Nothing.
- **Request:** Send a valid registration whose email address has no @ sign (made unique each time, so a leftover account from an earlier run can't answer "already in use" instead).
- **Expected response:** **422 Unprocessable Entity**, saying the email address is not valid. No account is created.
- **Basis:** Documented in contract (email format)
- **Changes data:** No (if the service works as documented)
- **Contract reference:** `UserRequest.email`: email format
- **Notes:** The live service accepts it and creates the account (**201 Created**). See finding 13.

### API-USR-10 — Logging in with the right details

- **Priority:** High
- **Type:** Authentication
- **Endpoint:** `POST /users/login`
- **Before you start:** Register a customer.
- **Request:** Send a login request with that customer's email and password.
- **Expected response:** **200 OK**. The response has an access key, its type (bearer) and how long it lasts (300 seconds).
- **Basis:** Documented in contract (shape); 300-second lifetime seen in live response
- **Changes data:** No
- **Contract reference:** `POST /users/login`: documented responses 200 (TokenResponse)

### API-USR-11 — Logging in with a wrong password or unknown email is refused

- **Priority:** High
- **Type:** Authentication
- **Endpoint:** `POST /users/login`
- **Before you start:** Register a customer.
- **Request:** Send a login request with details that don't match an account.
- **Variations:**

  | Email | Password |
  |---|---|
  | the registered customer's | a wrong password |
  | an address nobody registered | any password |

- **Expected response:** **401 Unauthorized** for both, with the same answer, so the response doesn't reveal whether the email address has an account. No access key is returned.
- **Basis:** Seen in live response (the contract documents only the successful login; see finding 17)
- **Changes data:** No
- **Contract reference:** `POST /users/login`: documented responses 200

### API-USR-12 — Logging in with details missing is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /users/login`
- **Before you start:** Register a customer.
- **Request:** Send a login request with details left out.
- **Variations:**

  | Sent |
  |---|
  | nothing at all |
  | the email address only |
  | the password only |

- **Expected response:** **401 Unauthorized**, saying the login request is invalid. No access key is returned.
- **Basis:** Seen in live response (see finding 17)
- **Changes data:** No
- **Contract reference:** `AccountRequest`: required email, password

### API-USR-13 — Reading my own profile

- **Priority:** High
- **Type:** Functional
- **Endpoint:** `GET /users/me`
- **Before you start:** Register a customer and log in.
- **Request:** Ask for the current customer's profile with that access key.
- **Expected response:** **200 OK**. The response has the documented customer details, and the name, email and ID match the customer that registered.
- **Basis:** Documented in contract
- **Changes data:** No
- **Contract reference:** `GET /users/me`: documented responses 200 (UserResponse), 401

### API-USR-14 — Renewing the access key

- **Priority:** Medium
- **Type:** Authentication
- **Endpoint:** `GET /users/refresh`
- **Before you start:** Register a customer and log in.
- **Request:** Ask for a renewed access key using the current one. Then read the profile, once with the new key and once with the old one.
- **Expected response:** **200 OK** with a new access key in the same shape as a login. The new key reads the profile; the old key is refused (**401 Unauthorized**).
- **Basis:** Documented in contract (the renewal); the old key being refused was seen in live response
- **Changes data:** No
- **Contract reference:** `GET /users/refresh`: documented responses 200, 400, 401

### API-USR-15 — Logging out ends the session

- **Priority:** High
- **Type:** Authentication
- **Endpoint:** `GET /users/logout`
- **Before you start:** Register a customer and log in.
- **Request:** Log out with the access key, then try to read the profile with the same key.
- **Expected response:** **200 OK**, with a message that the customer logged out. Reading the profile afterwards is refused (**401 Unauthorized**).
- **Basis:** Documented in contract (the log-out message); the key being refused afterwards was seen in live response
- **Changes data:** No
- **Contract reference:** `GET /users/logout`: documented responses 200, 400, 401

### API-USR-16 — Changing my password

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `POST /users/change-password`
- **Before you start:** Register a customer and log in.
- **Request:** Send the current password, a new strong password and the same new password again as confirmation. Then try to log in with the old password and with the new one.
- **Expected response:** **200 OK**, reporting success. Logging in with the old password is refused; logging in with the new one works.
- **Basis:** Documented in contract (the success response); the login results were seen in live response
- **Changes data:** Yes — changes the throwaway customer's own password. No clean-up needed.
- **Contract reference:** `POST /users/change-password`: documented responses 200, 401

### API-USR-17 — Changing my password with the wrong current password is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `POST /users/change-password`
- **Before you start:** Register a customer and log in.
- **Request:** Send a wrong current password and a valid new password with matching confirmation.
- **Expected response:** **400 Bad Request**, reporting failure and saying the current password doesn't match. The old password still works for logging in.
- **Basis:** Seen in live response (the contract documents only 200 and 401; see finding 17)
- **Changes data:** No
- **Contract reference:** `POST /users/change-password`: documented responses 200, 401

### API-USR-18 — Changing my password with a mismatched confirmation is refused

- **Priority:** Low
- **Type:** Validation
- **Endpoint:** `POST /users/change-password`
- **Before you start:** Register a customer and log in.
- **Request:** Send the right current password, a new password, and a different confirmation.
- **Expected response:** **422 Unprocessable Entity**, saying the confirmation doesn't match the new password.
- **Basis:** Seen in live response (see finding 17)
- **Changes data:** No
- **Contract reference:** `ChangePasswordRequest`

### API-USR-19 — Asking for a password reset for a registered email

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `POST /users/forgot-password`
- **Before you start:** Register a customer.
- **Request:** Ask for a password reset for that customer's email address.
- **Expected response:** **200 OK**, reporting success.
- **Basis:** Documented in contract
- **Changes data:** Yes — the demo may reset the throwaway customer's password. No clean-up needed; the account isn't reused.
- **Contract reference:** `POST /users/forgot-password`: documented responses 200, 400, 401, 403

### API-USR-20 — Asking for a password reset for an unknown email is refused

- **Priority:** Low
- **Type:** Validation
- **Endpoint:** `POST /users/forgot-password`
- **Before you start:** Nothing.
- **Request:** Ask for a password reset for an email address nobody registered.
- **Expected response:** **422 Unprocessable Entity**, saying the email address is not valid.
- **Basis:** Seen in live response (the contract documents 400 for bad requests; see finding 10)
- **Changes data:** No
- **Contract reference:** `POST /users/forgot-password`
- **Notes:** This tells a caller whether an email address has an account. Worth a decision by the product owner (finding 23).

### API-USR-21 — Asking for a password reset without an email is refused

- **Priority:** Low
- **Type:** Validation
- **Endpoint:** `POST /users/forgot-password`
- **Before you start:** Nothing.
- **Request:** Ask for a password reset with no email address.
- **Expected response:** **400 Bad Request** (or **422 Unprocessable Entity**, which this service uses for other validation errors), saying the email address is required.
- **Basis:** Documented in contract (400)
- **Changes data:** No
- **Contract reference:** `POST /users/forgot-password`: documented responses 200, 400, 401, 403
- **Notes:** The live service answers **404 Not Found** ("Requested item not found"). See finding 9.

### API-USR-22 — Reading my own user record

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `GET /users/{userId}`
- **Before you start:** Register a customer and log in.
- **Request:** Ask for the user record with that customer's own ID.
- **Expected response:** **200 OK** with the documented customer details for that customer.
- **Basis:** Documented in contract
- **Changes data:** No
- **Contract reference:** `GET /users/{userId}`: documented responses 200 (UserResponse), 401, 404, 405

### API-USR-23 — A customer can't read another customer's record

- **Priority:** High
- **Type:** Authorisation
- **Endpoint:** `GET /users/{userId}`
- **Before you start:** Register two customers. Log in as the first.
- **Request:** Ask for the second customer's user record.
- **Expected response:** **404 Not Found**, saying the customer isn't allowed to view this user. None of the second customer's details are returned.
- **Basis:** Documented in contract (404); message seen in live response
- **Changes data:** Yes — two throwaway customers (see API-USR-01).
- **Contract reference:** `GET /users/{userId}`: 404

### API-USR-24 — Reading a user that doesn't exist, or with a badly formed ID

- **Priority:** Low
- **Type:** Not found / Robustness
- **Endpoint:** `GET /users/{userId}`
- **Before you start:** Register a customer and log in.
- **Request:** Ask for a user record with an ID that isn't a real user.
- **Variations:**

  | User ID |
  |---|
  | a well-formed ID that doesn't exist |
  | text ("abc") |
  | a number ("123") |
  | a yes/no word ("true") |
  | a database injection attempt |
  | a script tag |

- **Expected response:** **404 Not Found** for each, with no user details and no server error.
- **Basis:** Documented in contract (404); seen in live response for every variation
- **Changes data:** No
- **Contract reference:** `GET /users/{userId}`: 404

### API-USR-25 — Changing some of my details

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `PATCH /users/{userId}`
- **Before you start:** Register a customer and log in.
- **Request:** Send only a new phone number for the customer's own ID. Then read the profile.
- **Expected response:** **200 OK**, reporting success. The profile shows the new phone number and everything else unchanged.
- **Basis:** Documented in contract
- **Changes data:** Yes — the throwaway customer's own phone number. No clean-up needed.
- **Contract reference:** `PATCH /users/{userId}`: documented responses 200, 401, 403, 405, 409, 422

### API-USR-26 — Replacing my details

- **Priority:** Medium
- **Type:** Functional
- **Endpoint:** `PUT /users/{userId}`
- **Before you start:** Register a customer and log in.
- **Request:** Send the customer's full details for their own ID, with a new first name. Then read the profile.
- **Expected response:** **200 OK**, reporting success. The profile shows the new first name.
- **Basis:** Documented in contract
- **Changes data:** Yes — the throwaway customer's own name. No clean-up needed.
- **Contract reference:** `PUT /users/{userId}`: documented responses 200, 401, 403, 405, 409, 422

### API-USR-27 — Changing my details to invalid values is refused

- **Priority:** Medium
- **Type:** Validation
- **Endpoint:** `PATCH /users/{userId}`, `PUT /users/{userId}`
- **Before you start:** Register a customer and log in.
- **Request:** Send a change for the customer's own ID with one invalid value at a time.
- **Variations:**

  | Change | Problem |
  |---|---|
  | first name of 41 characters | too long |
  | date of birth 10 years ago | too young |
  | first name as a number | not text |
  | full replacement with no details at all | required details missing |

- **Expected response:** **422 Unprocessable Entity** for each, naming the problem detail. The profile is unchanged.
- **Basis:** Seen in live response (limits and age rule documented in contract)
- **Changes data:** No
- **Contract reference:** `UserRequest`

### API-USR-28 — A customer can't change another customer's details

- **Priority:** High
- **Type:** Authorisation
- **Endpoint:** `PUT /users/{userId}`, `PATCH /users/{userId}`
- **Before you start:** Register two customers. Log in as the first.
- **Request:** Try to change the second customer's details.
- **Variations:**

  | Method |
  |---|
  | replace all details |
  | change only the phone number |

- **Expected response:** **403 Forbidden** for both, saying a customer can only update their own data. The second customer's details are unchanged.
- **Basis:** Documented in contract (403); message seen in live response
- **Changes data:** Yes — two throwaway customers (see API-USR-01).
- **Contract reference:** `PUT /users/{userId}`, `PATCH /users/{userId}`: 403

### API-USR-29 — Changing my email to one another customer uses is refused

- **Priority:** High
- **Type:** Business rule
- **Endpoint:** `PUT /users/{userId}`
- **Before you start:** Register two customers. Log in as the first.
- **Request:** Send the first customer's full details with the second customer's email address.
- **Expected response:** **409 Conflict**, saying the email address is already in use. No internal system details appear in the response.
- **Basis:** Documented in contract (409 DuplicateConflictResponse)
- **Changes data:** Yes — two throwaway customers (see API-USR-01).
- **Contract reference:** `PUT /users/{userId}`: 409
- **Notes:** The live service answers **403 Forbidden** with the raw database error, including the database name, host and the SQL statement. See finding 5.

### API-USR-30 — A customer can't delete another account

- **Priority:** Medium
- **Type:** Authorisation
- **Endpoint:** `DELETE /users/{userId}`
- **Before you start:** Register two customers. Log in as the first.
- **Request:** Try to delete the second customer.
- **Expected response:** **403 Forbidden**. The second customer can still log in.
- **Basis:** Documented in contract (403)
- **Changes data:** No (if refused). The two throwaway customers are created as in API-USR-01.
- **Contract reference:** `DELETE /users/{userId}`: 403

### API-USR-31 — A customer can't list all users

- **Priority:** Medium
- **Type:** Authorisation
- **Endpoint:** `GET /users`
- **Before you start:** Register a customer and log in.
- **Request:** Ask for the list of all users.
- **Expected response:** **403 Forbidden**. No user details are returned.
- **Basis:** Seen in live response (the contract documents 200, 400 and 401, but not 403; see finding 12)
- **Changes data:** No
- **Contract reference:** `GET /users`: documented responses 200, 400, 401

### API-USR-32 — A customer can't search other customers' details

- **Priority:** High
- **Type:** Authorisation
- **Endpoint:** `GET /users/search`
- **Before you start:** Register a customer and log in.
- **Request:** Search users for the name **Jane** (a published demo customer).
- **Expected response:** **403 Forbidden**, like listing all users (API-USR-31). No other customer's details are returned.
- **Basis:** Needs confirming (the contract doesn't say who may search)
- **Changes data:** No
- **Contract reference:** `GET /users/search`: documented responses 200 (list of UserResponse), 401, 404
- **Notes:** The live service returns the other customer's full record (name, email, phone, date of birth, address) to any logged-in customer. See finding 1.

### API-USR-33 — Account operations refuse requests without a valid access key

- **Priority:** High
- **Type:** Authentication
- **Endpoint:** all protected user operations (below)
- **Before you start:** Register a customer (to have a real user ID).
- **Request:** Call each operation once without an access key and once with an invalid one.
- **Variations:**

  | Operation |
  |---|
  | read my profile (`GET /users/me`) |
  | log out (`GET /users/logout`) |
  | change password (`POST /users/change-password`) |
  | read a user (`GET /users/{userId}`) |
  | replace a user's details (`PUT /users/{userId}`) |
  | change some of a user's details (`PATCH /users/{userId}`) |
  | delete a user (`DELETE /users/{userId}`) |
  | list all users (`GET /users`) |
  | search users (`GET /users/search`) |

- **Expected response:** **401 Unauthorized** for every operation and both kinds of key, with an "Unauthorized" message and no data.
- **Basis:** Documented in contract (401 UnauthorizedResponse on each)
- **Changes data:** No
- **Contract reference:** each operation's 401

### API-USR-34 — Renewing the access key without one is refused

- **Priority:** Medium
- **Type:** Authentication
- **Endpoint:** `GET /users/refresh`
- **Before you start:** Nothing.
- **Request:** Ask for a renewed access key without sending one.
- **Expected response:** **401 Unauthorized**, with an "Unauthorized" message.
- **Basis:** Documented in contract (401)
- **Changes data:** No
- **Contract reference:** `GET /users/refresh`: 401
- **Notes:** The live service answers **500 Internal Server Error**. See finding 6.

### API-USR-35 — Unsupported methods on user addresses are refused

- **Priority:** Low
- **Type:** Robustness
- **Endpoint:** `POST /users/{userId}`, `POST /users/me`, `DELETE /users`
- **Before you start:** Register a customer and log in.
- **Request:** Send a request with a method the address doesn't support.
- **Variations:**

  | Request |
  |---|
  | create (POST) on a user record |
  | create (POST) on my profile |
  | delete (DELETE) on the user list |

- **Expected response:** **405 Method Not Allowed** for each, saying the method isn't allowed for this route.
- **Basis:** Documented in contract (405 on `/users/{userId}`); the other two seen in live response
- **Changes data:** No
- **Contract reference:** `/users/{userId}`: 405 (MethodNotAllowedResponse)
