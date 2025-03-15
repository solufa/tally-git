import { describe, expect, test } from 'vitest';
import type { ProjectConfig } from '../src/types';
import {
  categorizeInsertions,
  checkTypePath,
  isExcludedPath,
  isPathMatched,
  isTestPath,
} from '../src/utils/insertions-classifier';

describe('insertions-classifier', () => {
  describe('isPathMatched', () => {
    test('パスが一致する場合はtrueを返す', () => {
      expect(isPathMatched('src/frontend/component.tsx', ['src/frontend'])).toBe(true);
      expect(isPathMatched('test/src/frontend/component.tsx', ['src/frontend'])).toBe(true);
      expect(isPathMatched('src/backend/api.ts', ['src/backend'])).toBe(true);
    });

    test('パスが一致しない場合はfalseを返す', () => {
      expect(isPathMatched('src/frontend/component.tsx', ['src/backend'])).toBe(false);
      expect(isPathMatched('src/utils/helper.ts', ['src/frontend', 'src/backend'])).toBe(false);
    });

    test('複数のパスのいずれかに一致する場合はtrueを返す', () => {
      expect(isPathMatched('src/frontend/component.tsx', ['src/backend', 'src/frontend'])).toBe(
        true,
      );
      expect(isPathMatched('src/backend/api.ts', ['src/frontend', 'src/backend'])).toBe(true);
    });

    test('空の配列の場合はfalseを返す', () => {
      expect(isPathMatched('src/frontend/component.tsx', [])).toBe(false);
    });
  });

  describe('isTestPath', () => {
    test('テストパスが一致する場合はtrueを返す', () => {
      expect(isTestPath('tests/frontend/component.test.tsx', ['tests/frontend'])).toBe(true);
      expect(isTestPath('src/tests/backend/api.test.ts', ['src/tests/backend'])).toBe(true);
    });

    test('テストパスが一致しない場合はfalseを返す', () => {
      expect(isTestPath('src/frontend/component.tsx', ['tests/frontend'])).toBe(false);
      expect(isTestPath('tests/backend/api.test.ts', ['tests/frontend'])).toBe(false);
    });

    test('テストパスがundefinedの場合はfalseを返す', () => {
      expect(isTestPath('tests/frontend/component.test.tsx', undefined)).toBe(false);
    });

    test('テストパスが空の配列の場合はfalseを返す', () => {
      expect(isTestPath('tests/frontend/component.test.tsx', [])).toBe(false);
    });
  });

  describe('isExcludedPath', () => {
    test('除外パスが一致する場合はtrueを返す', () => {
      expect(isExcludedPath('src/frontend/legacy/component.tsx', ['src/frontend/legacy'])).toBe(
        true,
      );
      expect(isExcludedPath('src/frontend/vendor/lib.ts', ['src/frontend/vendor'])).toBe(true);
    });

    test('除外パスが一致しない場合はfalseを返す', () => {
      expect(isExcludedPath('src/frontend/component.tsx', ['src/frontend/legacy'])).toBe(false);
      expect(isExcludedPath('src/backend/api.ts', ['src/frontend/vendor'])).toBe(false);
    });

    test('除外パスがundefinedの場合はfalseを返す', () => {
      expect(isExcludedPath('src/frontend/legacy/component.tsx', undefined)).toBe(false);
    });

    test('除外パスが空の配列の場合はfalseを返す', () => {
      expect(isExcludedPath('src/frontend/legacy/component.tsx', [])).toBe(false);
    });
  });

  describe('checkTypePath', () => {
    test('typeConfigがnullの場合はnullを返す', () => {
      const dirTypes = {};
      const result = checkTypePath('src/frontend/component.tsx', 10, dirTypes, 'frontend');
      expect(result).toBeNull();
    });

    test('除外パスに一致する場合はnullを返す', () => {
      const dirTypes = {
        frontend: {
          paths: ['src/frontend'],
          exclude: ['src/frontend/legacy'],
        },
      };
      const result = checkTypePath(
        'src/frontend/legacy/old-component.tsx',
        10,
        dirTypes,
        'frontend',
      );
      expect(result).toBeNull();
    });

    test('テストパスに一致する場合はテスト用のオブジェクトを返す', () => {
      const dirTypes = {
        frontend: {
          paths: ['src/frontend'],
          tests: ['tests/frontend'],
        },
      };
      const result = checkTypePath('tests/frontend/component.test.tsx', 10, dirTypes, 'frontend');
      expect(result).toEqual({ frontend: { code: 0, test: 10 }, others: 0 });
    });

    test('通常のパスに一致する場合はコード用のオブジェクトを返す', () => {
      const dirTypes = {
        frontend: {
          paths: ['src/frontend'],
        },
      };
      const result = checkTypePath('src/frontend/component.tsx', 10, dirTypes, 'frontend');
      expect(result).toEqual({ frontend: { code: 10 }, others: 0 });
    });

    test('パスが一致しない場合はnullを返す', () => {
      const dirTypes = {
        frontend: {
          paths: ['src/frontend'],
        },
      };
      const result = checkTypePath('src/backend/api.ts', 10, dirTypes, 'frontend');
      expect(result).toBeNull();
    });
  });

  describe('categorizeInsertions', () => {
    test('frontendパスに一致する場合はfrontendオブジェクトを返す', () => {
      const projectConfig: ProjectConfig = {
        dirTypes: {
          frontend: {
            paths: ['src/frontend'],
          },
        },
      };
      const result = categorizeInsertions('src/frontend/component.tsx', 10, projectConfig);
      expect(result).toEqual({ frontend: { code: 10 }, others: 0 });
    });

    test('backendパスに一致する場合はbackendオブジェクトを返す', () => {
      const projectConfig: ProjectConfig = {
        dirTypes: {
          backend: {
            paths: ['src/backend'],
          },
        },
      };
      const result = categorizeInsertions('src/backend/api.ts', 10, projectConfig);
      expect(result).toEqual({ backend: { code: 10 }, others: 0 });
    });

    test('infraパスに一致する場合はinfraオブジェクトを返す', () => {
      const projectConfig: ProjectConfig = {
        dirTypes: {
          infra: {
            paths: ['src/infra'],
          },
        },
      };
      const result = categorizeInsertions('src/infra/config.ts', 10, projectConfig);
      expect(result).toEqual({ infra: { code: 10 }, others: 0 });
    });

    test('どのパスにも一致しない場合はothersオブジェクトを返す', () => {
      const projectConfig: ProjectConfig = {
        dirTypes: {
          frontend: {
            paths: ['src/frontend'],
          },
          backend: {
            paths: ['src/backend'],
          },
          infra: {
            paths: ['src/infra'],
          },
        },
      };
      const result = categorizeInsertions('src/utils/helper.ts', 10, projectConfig);
      expect(result).toEqual({ others: 10 });
    });

    test('除外パスに一致する場合はothersオブジェクトを返す', () => {
      const projectConfig: ProjectConfig = {
        dirTypes: {
          frontend: {
            paths: ['src/frontend'],
            exclude: ['src/frontend/legacy'],
          },
        },
      };
      const result = categorizeInsertions(
        'src/frontend/legacy/old-component.tsx',
        10,
        projectConfig,
      );
      expect(result).toEqual({ others: 10 });
    });
  });
});
