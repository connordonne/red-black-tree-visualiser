// src/lib/pseudocode/index.ts

import { INSERT_CODE, INSERT_ANNOTATIONS } from './insert';
import { DELETE_CODE, DELETE_ANNOTATIONS } from './delete';

export const ALGORITHMS = {
    insert: INSERT_CODE,
    delete: DELETE_CODE
};

export const ANNOTATIONS: Record<'insert' | 'delete', Record<number, string>> = {
    insert: INSERT_ANNOTATIONS,
    delete: DELETE_ANNOTATIONS
};