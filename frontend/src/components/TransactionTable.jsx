import React, { useEffect, useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TablePagination, TableSortLabel, Box
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import TableFilters from './TableFilters';

const TransactionTable = ({ fetchData, columns, filtersConfig, initialParams = {} }) => {
    // directly use search params as our state:
    const [searchParams, setSearchParams] = useSearchParams(initialParams);
    const navigate = useNavigate();
    const path = useLocation().pathname;

    // convert searchParams into a plain object for the labels of the table
    const params = Object.fromEntries(searchParams.entries());

    // useMemo to update our a local state of the params
    // use this query to check if we need to call the API
    const query = useMemo(() => {
        return Object.fromEntries(searchParams.entries())
    }, [searchParams]);

    // table data
    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    // states for sorting the table
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState(null);

    // whenever query changes, fetch data
    // since we are controlling state via setSearchParams, 
    // don't update it here
    useEffect(() => {
        const fetchTableData = async () => {
            try {
                // fetchData should return { count, results }
                const response = await fetchData(query);
                setTotalCount(response.count);
                setData(response.results);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTableData();
    }, [query, initialParams]);


    useEffect(() => {
        setOrder(searchParams.get('order') || 'asc');
        setOrderBy(searchParams.get('orderBy') || null);
    }, [searchParams]);

    // pagination handlers:
    // update the page number/limit
    const handleChangePage = (event, newPage) => {
        // newPage is 0-indexed, so add 1
        setSearchParams({ ...query, page: newPage + 1 });
    };

    const handleChangeRowsPerPage = (event) => {
        const newLimit = parseInt(event.target.value, 10);
        // reset to page 1 when rows per page change
        setSearchParams({ ...query, limit: newLimit, page: 1 });
    };

    // order-by handler:
    const handleSortRequest = (column) => {
        // if already ascending, flip to order to desc upon request
        const isAsc = orderBy === column && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(column);

        // update url search params
        setSearchParams({ ...query, order: isAsc ? 'desc' : 'asc', orderBy: column });
    };

    // handle row click
    const handleRowClick = (row) => {
        navigate(`${path}/${row.id}`);
    };

    // clean params for the filters
    const cleanParams = (params) => {
        const cleaned = { ...params };
        for (const key in cleaned) {
            if (
                cleaned[key] === '' ||
                cleaned[key] === undefined ||
                cleaned[key] === 'undefined'
            ) {
                delete cleaned[key];
            }
        }
        return cleaned;
    };

    return (<>
        <Box display="flex" flexDirection="column" alignItems="center" width="100%">
            <TableFilters
                filtersConfig={filtersConfig}
                params={params}
                onChange={(next) => setSearchParams(cleanParams(next))}
            />
            <Paper>
                <TableContainer className="table-box" component={Paper} sx={{ maxWidth: '90vw', width: 1000, maxHeight: 400 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableCell className="table-head"
                                        key={col.field}
                                        sortDirection={orderBy === col.field ? order : false}
                                    >
                                        <TableSortLabel
                                            active={orderBy === col.field}
                                            direction={orderBy === col.field ? order : 'asc'}
                                            onClick={() => handleSortRequest(col.field)}
                                        >
                                            {col.headerName}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.id} hover onClick={() => handleRowClick(row)} sx={{cursor: "pointer"}}>
                                    {columns.map((col) => (
                                        <TableCell key={col.field} 
                                        sx={{
                                            bgcolor: 
                                                row.type === "redemption" ? "#ffcc9f" :
                                                row.type === "purchase" ? "#bdf6ba" :
                                                row.type === "adjustment" ? "#b2b2ff" :
                                                row.type === "transfer" ? "#8fd3e9":
                                                "#ffbebe"

                                        }}>
                                            {/* use custom renderCell function if defined:
                                        e.g. activated is not an actual field in user,
                                        so we need to check if lastLogin is null.
                                        renderCell is defined in the column prop
                                        passed in to this component */}
                                            {col.renderCell
                                                ? col.renderCell(row)
                                                : String(row[col.field])
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={params.page ? parseInt(params.page, 10) - 1 : 0}
                    onPageChange={handleChangePage}
                    rowsPerPage={params.limit ? parseInt(params.limit, 10) : 10}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Paper>
        </Box>
    </>
    );
};

export default TransactionTable;