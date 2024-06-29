# Team Management Dashboard

This project is a React-based dashboard for managing team members. It provides functionality for viewing, adding, editing, and deleting team members, as well as sorting and filtering capabilities.

## Features

- View a list of team members with details such as name, status, role, email, and teams
- Add new team members
- Edit existing team member details
- Delete individual or multiple team members
- Sort team members by various fields
- Search for team members
- Pagination for large datasets

## Technologies Used

- React
- TypeScript
- Axios for API calls
- Tailwind CSS for styling

## Project Structure

The project consists of the following main components and files:

- `TeamSettings.tsx`: The main component that renders the team management dashboard
- `Pagination.tsx`: A reusable component for pagination
- `SortIcon.tsx`: A component for rendering sort icons in table headers
- `ValidationMessage.tsx`: A component for displaying validation messages
- `api.ts`: Contains functions for making API calls
- `endpoints.ts`: Defines API endpoints
- `config.ts`: Contains configuration variables like API URL
- `types.ts`: Defines TypeScript interfaces used throughout the project

## Setup and Installation

1. Clone the repository
2. Install dependencies:
3. Set up your API endpoint in `config.ts`
4. Run the development server:
   
## API Integration

The project is set up to work with a RESTful API. The base URL for the API is defined in `config.ts`. The following endpoints are used:

- GET `/members`: Fetch team members
- POST `/members`: Add a new team member
- PUT `/members/:id`: Update a team member
- POST `/members/delete`: Delete multiple team members

Make sure your API implements these endpoints with the expected request and response formats.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
