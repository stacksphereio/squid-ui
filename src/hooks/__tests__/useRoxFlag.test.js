// src/hooks/__tests__/useRoxFlag.test.js
import { renderHook, act } from '@testing-library/react';
import useRoxFlag from '../useRoxFlag';
import { __pushFlags } from '../../flags';

jest.mock('../../flags');

describe('useRoxFlag', () => {
  beforeEach(() => {
    // Reset flags to initial state before each test
    __pushFlags({
      showTopBannerEnhanced: false,
      showDebugFooter: false,
      adminHealth: false,
      testFlag: false,
      dynamicFlag: false,
      counter: false,
      truthyFlag: false,
      falsyFlag: false,
      flag1: false,
      flag2: false,
      watchedFlag: false,
      otherFlag: false,
      someFlag: false,
    });
  });

  it('returns false for missing flag key', () => {
    const { result } = renderHook(() => useRoxFlag('nonExistentFlag'));
    expect(result.current).toBe(false);
  });

  it('returns true when flag is enabled', () => {
    act(() => {
      __pushFlags({ testFlag: true });
    });

    const { result } = renderHook(() => useRoxFlag('testFlag'));
    expect(result.current).toBe(true);
  });

  it('returns false when flag is disabled', () => {
    act(() => {
      __pushFlags({ testFlag: false });
    });

    const { result } = renderHook(() => useRoxFlag('testFlag'));
    expect(result.current).toBe(false);
  });

  it('updates when flag changes', () => {
    const { result } = renderHook(() => useRoxFlag('dynamicFlag'));
    expect(result.current).toBe(false);

    // Simulate flag change
    act(() => {
      __pushFlags({ dynamicFlag: true });
    });

    expect(result.current).toBe(true);
  });

  it('handles multiple flag updates', () => {
    const { result } = renderHook(() => useRoxFlag('counter'));
    expect(result.current).toBe(false);

    // First update: enable flag
    act(() => {
      __pushFlags({ counter: true });
    });
    expect(result.current).toBe(true);

    // Second update: disable flag
    act(() => {
      __pushFlags({ counter: false });
    });
    expect(result.current).toBe(false);

    // Third update: enable again
    act(() => {
      __pushFlags({ counter: true });
    });
    expect(result.current).toBe(true);
  });

  it('handles truthy non-boolean values as true', () => {
    act(() => {
      __pushFlags({ truthyFlag: 'yes' });
    });

    const { result } = renderHook(() => useRoxFlag('truthyFlag'));
    expect(result.current).toBe(true);
  });

  it('handles falsy non-boolean values as false', () => {
    act(() => {
      __pushFlags({ falsyFlag: 0 });
    });

    const { result } = renderHook(() => useRoxFlag('falsyFlag'));
    expect(result.current).toBe(false);
  });

  it('maintains separate state for different flag keys', () => {
    act(() => {
      __pushFlags({ flag1: true, flag2: false });
    });

    const { result: result1 } = renderHook(() => useRoxFlag('flag1'));
    const { result: result2 } = renderHook(() => useRoxFlag('flag2'));

    expect(result1.current).toBe(true);
    expect(result2.current).toBe(false);
  });

  it('only updates when subscribed flag changes', () => {
    const { result } = renderHook(() => useRoxFlag('watchedFlag'));
    expect(result.current).toBe(false);

    // Update different flag - watched flag should remain false
    act(() => {
      __pushFlags({ otherFlag: true });
    });

    expect(result.current).toBe(false);

    // Update watched flag - should trigger update
    act(() => {
      __pushFlags({ watchedFlag: true });
    });

    expect(result.current).toBe(true);
  });

  it('handles undefined flag value as false', () => {
    act(() => {
      __pushFlags({ someFlag: undefined });
    });

    const { result } = renderHook(() => useRoxFlag('someFlag'));
    expect(result.current).toBe(false);
  });

  it('handles null flag value as false', () => {
    act(() => {
      __pushFlags({ someFlag: null });
    });

    const { result } = renderHook(() => useRoxFlag('someFlag'));
    expect(result.current).toBe(false);
  });

  it('re-subscribes when key changes', () => {
    act(() => {
      __pushFlags({ flag1: true, flag2: false });
    });

    const { result, rerender } = renderHook(
      ({ key }) => useRoxFlag(key),
      { initialProps: { key: 'flag1' } }
    );

    expect(result.current).toBe(true);

    // Change to different key
    rerender({ key: 'flag2' });

    expect(result.current).toBe(false);
  });

  it('reflects changes from initial subscription', () => {
    // Set flag before hook mounts
    act(() => {
      __pushFlags({ testFlag: true });
    });

    // Hook should see the current state
    const { result } = renderHook(() => useRoxFlag('testFlag'));
    expect(result.current).toBe(true);
  });
});
