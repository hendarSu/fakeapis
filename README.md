# Fake API Generator

A tool to generate mock APIs from curl commands with dynamic response values based on request body, query parameters, or URL parameters.

## Features

- Parse curl commands to extract method, URL, headers, and body
- Configure which response values should be dynamic based on request data
- Support for different HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Manage and list all your fake API endpoints
- Test your endpoints directly from the application

## How to Use

1. **Parse a curl command**:
   - Paste a curl command into the input field
   - Click "Parse cURL" to extract the request details

2. **Configure your API**:
   - Give your API a name
   - Modify the response template if needed
   - Configure dynamic fields by mapping response fields to request data

3. **Create the API**:
   - Click "Create Fake API" to generate your endpoint
   - The API will be available at `/api/fake/[id]`

4. **Use your API**:
   - Copy the API URL to use in your applications
   - The API will respond according to your configuration
   - Dynamic fields will be populated based on the request data

## Dynamic Field Mapping

You can map fields in your response to values from:

- **Request Body**: Values from the JSON body of the request
- **Query Parameters**: Values from the URL query string
- **URL Parameters**: Values from path parameters in the URL

For example, if your response has a field `user.name` and you want it to be populated from the request body field `data.username`, you would create a mapping:

- Response Field: `user.name`
- Source Type: Request Body
- Source Path: `data.username`

## Example

If you create an API with the path `/users/:id` and map the response field `user.id` to the URL parameter `id`, then when you call `/api/fake/[api-id]/users/123`, the response will include `{"user":{"id":"123"}}`.
