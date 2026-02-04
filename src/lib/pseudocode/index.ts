// src/lib/pseudocode/index.ts

import { INSERT_CODE, INSERT_ANNOTATIONS } from './insert';
import { DELETE_CODE, DELETE_ANNOTATIONS } from './delete';
import { FIND_CODE, FIND_ANNOTATIONS } from './find';

export const ALGORITHMS = {
    insert: INSERT_CODE,
    delete: DELETE_CODE,
    find: FIND_CODE
};

export const ANNOTATIONS: Record<'insert' | 'delete' | 'find', Record<number, string>> = {
    insert: INSERT_ANNOTATIONS,
    delete: DELETE_ANNOTATIONS,
    find: FIND_ANNOTATIONS
};