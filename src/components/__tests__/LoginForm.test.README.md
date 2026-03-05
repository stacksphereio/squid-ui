# LoginForm Tests

This test suite validates the authentication flow and error handling in the LoginForm component.

## Test Coverage

### 1. Blank Credentials Validation
Tests that the form validates empty fields **before** making API calls:

- Both username and password blank → "Please enter both username and password."
- Only username blank → Same error message
- Only password blank → Same error message
- Username is whitespace only → Same error message
- Password is whitespace only → Same error message

**Expected Behavior:** No API call should be made when validation fails.

### 2. Valid Credentials
Tests successful authentication:

- Valid username and password → Calls `login()` API and triggers `onLogin()` callback

### 3. Authentication Errors
Tests different API error responses:

- **Invalid credentials (401/403)** → "Invalid username or password. Please try again."
- **Service unavailable (502/503/504)** → "Authentication service is temporarily unavailable. Please try again later."

### 4. Form State
Tests UI state during submission:

- Submit button disabled while authenticating
- Button text changes to "Signing in…"
- Button re-enabled after completion

## Running Tests

```bash
# Run all LoginForm tests
npm test -- LoginForm.test.js

# Run with coverage
npm test -- LoginForm.test.js --coverage

# Watch mode
npm test -- LoginForm.test.js --watch
```

## Expected Error Messages

| Scenario | Error Message |
|----------|--------------|
| Blank credentials | "Please enter both username and password." |
| Wrong credentials (401/403) | "Invalid username or password. Please try again." |
| Service down (502/503/504) | "Authentication service is temporarily unavailable. Please try again later." |
| Network error | "Unable to connect to authentication service. Please check your connection and try again." |
| Other errors (4xx/5xx) | "Login failed. Please try again or contact support if the problem persists." |

## Troubleshooting

If you're seeing "Authentication service is temporarily unavailable" for blank credentials:

1. **Check deployment** - Ensure the latest code is deployed (validation happens client-side)
2. **Clear browser cache** - Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
3. **Check console** - Look for JavaScript errors that might prevent validation
4. **Verify build** - Ensure the built bundle includes the validation code
5. **Run tests** - Confirm tests pass locally: `npm test -- LoginForm.test.js`

## Implementation Details

The validation logic is in `LoginForm.js` lines 15-19:

```javascript
if (!username.trim() || !password.trim()) {
  setError('Please enter both username and password.');
  return;
}
```

This runs **before** `setSubmitting(true)` and **before** calling the `login()` API.
