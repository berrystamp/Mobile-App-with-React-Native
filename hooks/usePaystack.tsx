/**
 * usePaystack
 *
 * A self-contained Paystack inline-checkout hook backed by a WebView modal.
 * Usage:
 *
 *   const { initializePayment, PaystackWebView } = usePaystack();
 *
 *   // Call this to open the Paystack checkout sheet
 *   initializePayment({
 *     email: 'user@example.com',
 *     amount: 5000,        // in NAIRA — the hook converts to kobo internally
 *     orderId: 42,
 *     onSuccess: (reference) => { ... },
 *     onCancel:  ()          => { ... },
 *   });
 *
 *   // Render the WebView somewhere in your JSX
 *   <PaystackWebView />
 *
 * Environment:
 *   Set EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY in your .env file.
 */

import { ENV } from '@/lib/config/env';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaystackPaymentOptions {
  /** Customer email — required by Paystack */
  email: string;
  /** Amount in NAIRA (the hook multiplies by 100 for kobo) */
  amount: number;
  /** Your internal order ID — used as the `metadata.orderId` field */
  orderId: number | string;
  /** Called with the Paystack reference when the transaction completes */
  onSuccess: (reference: string) => void;
  /** Called when the user closes the sheet without paying */
  onCancel?: () => void;
  /** Optional currency override. Defaults to "NGN" */
  currency?: string;
}

interface PaystackState {
  visible: boolean;
  options: PaystackPaymentOptions | null;
}

// ─── HTML template ────────────────────────────────────────────────────────────

/**
 * Generates a minimal HTML page that loads the Paystack Inline JS and
 * posts messages back to React Native:
 *   { type: 'success', reference: '...' }
 *   { type: 'cancel' }
 *   { type: 'close' }
 */
const buildPaystackHtml = (opts: PaystackPaymentOptions): string => {
  const amountInKobo = Math.round(opts.amount * 100);
  const key = ENV.PAYSTACK_PUBLIC_KEY;
  const currency = opts.currency ?? 'NGN';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>Paystack Checkout</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
      background: #f8f9fa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .container { text-align: center; padding: 24px; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #e8e3f7;
      border-top-color: #4A3298; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { color: #4A3298; font-size: 15px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Loading payment...</p>
  </div>

  <script src="https://js.paystack.co/v1/inline.js"></script>
  <script>
    function postMsg(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    window.addEventListener('load', function () {
      try {
        var handler = PaystackPop.setup({
          key: '${key}',
          email: '${opts.email}',
          amount: ${amountInKobo},
          currency: '${currency}',
          ref: 'order_${opts.orderId}_' + Date.now(),
          metadata: {
            custom_fields: [],
            orderId: '${opts.orderId}'
          },
          callback: function (response) {
            postMsg({ type: 'success', reference: response.reference });
          },
          onClose: function () {
            postMsg({ type: 'cancel' });
          }
        });
        handler.openIframe();
      } catch (e) {
        postMsg({ type: 'error', message: String(e) });
      }
    });
  </script>
</body>
</html>
  `.trim();
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePaystack() {
  const [state, setState] = useState<PaystackState>({ visible: false, options: null });
  const webViewRef = useRef<any>(null);

  const initializePayment = useCallback((opts: PaystackPaymentOptions) => {
    setState({ visible: true, options: opts });
  }, []);

  const dismiss = useCallback(() => {
    setState({ visible: false, options: null });
  }, []);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === 'success') {
          dismiss();
          state.options?.onSuccess(data.reference as string);
        } else if (data.type === 'cancel' || data.type === 'close') {
          dismiss();
          state.options?.onCancel?.();
        } else if (data.type === 'error') {
          console.warn('[Paystack] Error from WebView:', data.message);
          dismiss();
          state.options?.onCancel?.();
        }
      } catch {
        // ignore parse errors
      }
    },
    [dismiss, state.options],
  );

  /**
   * Intercept navigations that indicate a terminal Paystack state.
   * Paystack redirects to a callback URL on success — we catch that here too.
   */
  const handleNavigationChange = useCallback(
    (navState: WebViewNavigation) => {
      const url = navState.url || '';
      // If Paystack redirects to your own callback domain, intercept it
      if (
        url.includes('paystack.com/close') ||
        url.includes('checkout/cancel')
      ) {
        dismiss();
        state.options?.onCancel?.();
      }
    },
    [dismiss, state.options],
  );

  /** Render this anywhere — it mounts an invisible modal when not active */
  const PaystackWebView = useCallback(() => {
    if (!state.options) return null;

    const html = buildPaystackHtml(state.options);

    return (
      <Modal
        visible={state.visible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          dismiss();
          state.options?.onCancel?.();
        }}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                dismiss();
                state.options?.onCancel?.();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <View style={styles.closeBtn} />
          </View>

          {/* WebView */}
          <WebView
            ref={webViewRef}
            source={{ html, baseUrl: 'https://js.paystack.co' }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            allowsInlineMediaPlayback
            mixedContentMode="compatibility"
            onMessage={handleMessage}
            onNavigationStateChange={handleNavigationChange}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4A3298" />
                <Text style={styles.loadingText}>Connecting to Paystack...</Text>
              </View>
            )}
            style={styles.webView}
          />
        </View>
      </Modal>
    );
  }, [state, dismiss, handleMessage, handleNavigationChange]);

  return { initializePayment, PaystackWebView, isDismissed: !state.visible };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e3f7',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f3fa',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#4A3298',
    fontWeight: '700',
  },
  webView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#4A3298',
    fontWeight: '500',
    marginTop: 8,
  },
});