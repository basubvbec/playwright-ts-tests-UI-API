import { test, expect } from '@playwright/test';

// Base URL for the public mock API
const BASE_URL = 'https://reqres.in/api';

test.describe('API CRUD Operations Automation', () => {
  
  // 1. CREATE (POST)
  test('Should create a new user via POST', async ({ request }) => {
    const payload = {
      name: 'John Doe',
      job: 'QA Automation Engineer'
    };

    const response = await request.post(`${BASE_URL}/users`, {
      data: payload
    });

    // Assert status code is 201 (Created)
    expect(response.status()).toBe(201);

    // Parse JSON response and assert data
    const responseBody = await response.json();
    expect(responseBody.name).toBe(payload.name);
    expect(responseBody.job).toBe(payload.job);
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('createdAt');
  });

  // 2. READ (GET)
  test('Should fetch user details via GET', async ({ request }) => {
    // Fetching user with ID 2
    const response = await request.get(`${BASE_URL}/users/2`);

    // Assert status code is 200 (OK)
    expect(response.status()).toBe(200);

    // Parse and validate response
    const responseBody = await response.json();
    expect(responseBody.data.id).toBe(2);
    expect(responseBody.data.first_name).toBe('Janet');
    expect(responseBody.data.email).toContain('@reqres.in');
  });

  // 3. UPDATE (PUT)
  test('Should update user details via PUT', async ({ request }) => {
    const updatePayload = {
      name: 'John Doe Updated',
      job: 'Senior QA Engineer'
    };

    // Updating user with ID 2
    const response = await request.put(`${BASE_URL}/users/2`, {
      data: updatePayload
    });

    // Assert status code is 200 (OK)
    expect(response.status()).toBe(200);

    // Validate the updated properties
    const responseBody = await response.json();
    expect(responseBody.name).toBe(updatePayload.name);
    expect(responseBody.job).toBe(updatePayload.job);
    expect(responseBody).toHaveProperty('updatedAt');
  });

  // 4. DELETE (DELETE)
  test('Should delete user via DELETE', async ({ request }) => {
    // Deleting user with ID 2
    const response = await request.delete(`${BASE_URL}/users/2`);

    // Assert status code is 204 (No Content) which is standard for successful deletions
    expect(response.status()).toBe(204);
  });

});