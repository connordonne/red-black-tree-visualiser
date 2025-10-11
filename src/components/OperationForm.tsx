// src/components/OperationForm.tsx

import React, { useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button, type ButtonProps } from "@/components/ui/button";
import { normalizeNumberInput } from '@/lib/utils';

interface OperationFormProps {
    value: string;
    setValue: (val: string) => void;
    onSubmit: () => void;
    buttonText: string;
    buttonVariant?: ButtonProps['variant'];
    buttonIcon: React.ReactNode;
    placeholder?: string;
    isActive: boolean; // To control focus
}

export function OperationForm({ value, setValue, onSubmit, buttonText, buttonVariant, buttonIcon, placeholder, isActive }: OperationFormProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus the input when its tab becomes active
    useEffect(() => {
        if (isActive) {
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [isActive]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
        // Refocus after submit for quick subsequent operations
        requestAnimationFrame(() => inputRef.current?.focus());
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
                ref={inputRef}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={placeholder || "e.g. 42"}
                value={value}
                onChange={(e) => setValue(normalizeNumberInput(e.target.value))}
            />
            <Button type="submit" variant={buttonVariant}>
                {buttonIcon}
                {buttonText}
            </Button>
        </form>
    );
}