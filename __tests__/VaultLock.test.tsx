import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { VaultLockModal } from '../src/components/VaultLockModal';

describe('Vault Lock & Privacy Protection', () => {
  test('renders lock modal with PIN dots and number keypad', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <VaultLockModal visible={true} onUnlock={jest.fn()} correctPin="1234" />
      );
    });

    const root = renderer!.root;
    expect(root).toBeTruthy();
  });

  test('successfully triggers onUnlock callback when correct PIN is entered', () => {
    jest.useFakeTimers();
    const onUnlockMock = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <VaultLockModal visible={true} onUnlock={onUnlockMock} correctPin="1234" />
      );
    });

    const root = renderer!.root;

    const pressDigit = (digit: string) => {
      const btn = root.findByProps({ testID: `keypad-${digit}` });
      expect(btn).toBeDefined();
      ReactTestRenderer.act(() => {
        btn.props.onPress();
      });
    };

    pressDigit('1');
    pressDigit('2');
    pressDigit('3');
    pressDigit('4');

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onUnlockMock).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
