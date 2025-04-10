import React, { useState } from 'react';
import PaginatedTable from '../components/PaginatedTable';
import { useUser } from '../contexts/UserContext';

const UsersList = () => {
    // pass in getUsers as a prop for the paginated table component
    const { getUsers } = useUser();

    // define columns for the table
    const columns = [
        { field: 'utorid', headerName: 'UTORid' },
        { field: 'name', headerName: 'Name' },
        { field: 'email', headerName: 'Email' },
        { field: 'role', headerName: 'Role' },
        {
            field: 'verified',
            headerName: 'Verified',
            renderCell: (value) => value.verified ? 'Yes' : 'No'
        },
        {
            field: 'activated',
            headerName: 'Activated',
            renderCell: (row) => row.lastLogin !== null ? 'Yes' : 'No'
        },
        { field: 'points', headerName: 'Points' },
    ];

    // define configuration for filters for this table:
    const filtersConfig = [
        { field: 'name', label: 'Search by name or UTORid', type: 'text' },
        { field: 'role', label: 'Role', type: 'select', options: ['regular', 'cashier', 'manager', 'superuser'] },
        { field: 'verified', label: 'Verified', type: 'boolean' },
        { field: 'activated', label: 'Activated', type: 'boolean' },
    ];
    
    const [initialParams, setInitialParams] = useState({ page: 1, limit: 10 });

    return (
        <div>
            <h2>Users List</h2>
            <PaginatedTable
                fetchData={getUsers}
                columns={columns}
                filtersConfig={filtersConfig}
                initialParams={initialParams}
            />
        </div>
    );
};

export default UsersList;