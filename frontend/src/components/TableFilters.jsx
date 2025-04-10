import {
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormControlLabel,
    Checkbox,
    Button,
} from '@mui/material';

const TableFilters = ({ filtersConfig, params, onChange }) => {
    const handleReset = () => {
        const cleared = {};
        for (const filter of filtersConfig) {
            cleared[filter.field] = undefined;
        }
        onChange({ ...cleared, page: 1 });
    };

    return (
        <Box className="filter-box" p={2} display="flex" gap={2} flexWrap="wrap" justifyContent="center" width="100w">
            {filtersConfig.map((filter) => {
                const value = params[filter.field] ?? '';

                switch (filter.type) {
                    case 'text':
                        return (
                            <TextField
                                key={filter.field}
                                label={filter.label}
                                value={value}
                                onChange={(e) =>
                                    onChange({ ...params, [filter.field]: e.target.value, page: 1 })
                                }
                            />
                        );
                    case 'select':
                        return (
                            <FormControl key={filter.field} sx={{ minWidth: 100 }}>
                                <InputLabel id={`${filter.field}-label`}>{filter.label}</InputLabel>
                                <Select
                                    labelId={`${filter.field}-label`}
                                    label={filter.label}
                                    value={value}
                                    onChange={(e) =>
                                        onChange({ ...params, [filter.field]: e.target.value, page: 1 })
                                    }
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {filter.options.map((opt) => (
                                        <MenuItem key={opt} value={opt}>
                                            {opt}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        );
                    case 'boolean':
                        return (
                            <FormControl key={filter.field} sx={{ minWidth: 120 }}>
                                <InputLabel id={`${filter.field}-label`}>{filter.label}</InputLabel>
                                <Select
                                    labelId={`${filter.field}-label`}
                                    label={filter.label}
                                    value={
                                        params[filter.field] === undefined
                                            ? ''
                                            : params[filter.field] === 'true'
                                                ? 'true'
                                                : 'false'
                                    }
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onChange({
                                            ...params,
                                            [filter.field]: val === '' ? undefined : val,
                                            page: 1,
                                        });
                                    }}

                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="true">Yes</MenuItem>
                                    <MenuItem value="false">No</MenuItem>
                                </Select>
                            </FormControl>
                        );
                    default:
                        return null;
                }
            })}
            <Button variant="outlined" onClick={handleReset}>
                Reset
            </Button>
        </Box>
    );
};

export default TableFilters;
