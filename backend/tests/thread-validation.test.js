import test from 'node:test';
import assert from 'node:assert/strict';

import { validateThreadInput } from '../src/services/thread.service.js';

test('thread content accepts exactly 2000 characters', () => {
    const result = validateThreadInput({
        title: 'Título válido',
        content: 'a'.repeat(2000),
    });

    assert.equal(result.content.length, 2000);
});

test('thread content rejects more than 2000 characters', () => {
    assert.throws(
        () => validateThreadInput({
            title: 'Título válido',
            content: 'a'.repeat(2001),
        }),
        /2000 caracteres/,
    );
});

test('thread content rejects more than 2000 characters on partial update', () => {
    assert.throws(
        () => validateThreadInput(
            { content: 'a'.repeat(2001) },
            { partial: true },
        ),
        /2000 caracteres/,
    );
});

test('thread title still rejects more than 100 characters', () => {
    assert.throws(
        () => validateThreadInput({
            title: 'a'.repeat(101),
            content: 'Conteúdo válido',
        }),
        /100 caracteres/,
    );
});
