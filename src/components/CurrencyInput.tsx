import React, { useState, useEffect } from "react";

export const CurrencyInput = ({ value, onChange, placeholder, name, className, required = false }: any) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
        if (value !== undefined && value !== null) {
            setDisplayValue(formatNumber(value.toString()));
        }
    }, [value]);

    const formatNumber = (val: string) => val.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const handleChange = (e: any) => {
        const raw = e.target.value.replace(/\./g, "");
        if (!/^\d*$/.test(raw)) return;
        setDisplayValue(formatNumber(raw));
        if (onChange) onChange(raw);
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            name={name}
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            required={required}
            autoComplete="off"
        />
    );
};
