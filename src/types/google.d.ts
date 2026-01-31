/**
 * Google Identity Services (GIS) Type Definitions
 * @see https://developers.google.com/identity/gsi/web/reference/js-reference
 */

declare namespace google {
  namespace accounts {
    namespace id {
      /**
       * Initialize the Google Sign-In client
       */
      function initialize(config: GsiClientConfig): void;

      /**
       * Render the Sign-In button
       */
      function renderButton(
        parent: HTMLElement,
        options: GsiButtonConfig
      ): void;

      /**
       * Prompt the One Tap dialog
       */
      function prompt(momentListener?: (notification: PromptMomentNotification) => void): void;

      /**
       * Cancel the One Tap dialog
       */
      function cancel(): void;

      /**
       * Revoke the user's consent
       */
      function revoke(hint: string, callback: (response: RevocationResponse) => void): void;

      /**
       * Disable automatic selection
       */
      function disableAutoSelect(): void;

      /**
       * Store the user's credential
       */
      function storeCredential(credential: Credential, callback: () => void): void;
    }
  }
}

/**
 * Google Sign-In client configuration
 */
interface GsiClientConfig {
  /** Your Google API client ID */
  client_id: string;
  /** Callback when sign-in succeeds */
  callback: (response: CredentialResponse) => void;
  /** Whether to automatically select the account */
  auto_select?: boolean;
  /** Login hint (email) */
  login_hint?: string;
  /** Hosted domain */
  hd?: string;
  /** Use FedCM */
  use_fedcm_for_prompt?: boolean;
  /** Nonce for ID token */
  nonce?: string;
  /** Context for One Tap */
  context?: 'signin' | 'signup' | 'use';
  /** State cookie domain */
  state_cookie_domain?: string;
  /** Allowed parent origin for iframe */
  allowed_parent_origin?: string | string[];
  /** Intermediate iframe close callback */
  intermediate_iframe_close_callback?: () => void;
  /** ITp support */
  itp_support?: boolean;
  /** Login URI */
  login_uri?: string;
  /** Cancel on tap outside */
  cancel_on_tap_outside?: boolean;
  /** Prompt parent ID */
  prompt_parent_id?: string;
}

/**
 * Credential response from Google Sign-In
 */
interface CredentialResponse {
  /** JWT credential token */
  credential: string;
  /** How the credential was selected */
  select_by:
    | 'auto'
    | 'user'
    | 'user_1tap'
    | 'user_2tap'
    | 'btn'
    | 'btn_confirm'
    | 'btn_add_session'
    | 'btn_confirm_add_session';
  /** Client ID */
  clientId?: string;
}

/**
 * Button configuration
 */
interface GsiButtonConfig {
  /** Button type */
  type?: 'standard' | 'icon';
  /** Button theme */
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  /** Button size */
  size?: 'large' | 'medium' | 'small';
  /** Button text */
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  /** Button shape */
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  /** Logo alignment */
  logo_alignment?: 'left' | 'center';
  /** Button width */
  width?: number;
  /** Locale */
  locale?: string;
  /** Click listener */
  click_listener?: () => void;
}

/**
 * Prompt moment notification
 */
interface PromptMomentNotification {
  /** Check if moment is display moment */
  isDisplayMoment(): boolean;
  /** Check if moment is displayed */
  isDisplayed(): boolean;
  /** Check if moment is skipped */
  isSkippedMoment(): boolean;
  /** Check if moment is dismissed */
  isDismissedMoment(): boolean;
  /** Get moment type */
  getMomentType(): 'display' | 'skipped' | 'dismissed';
  /** Get dismissed reason */
  getDismissedReason(): 'credential_returned' | 'cancel_called' | 'flow_restarted';
  /** Get skipped reason */
  getSkippedReason(): 'auto_cancel' | 'user_cancel' | 'tap_outside' | 'issuing_failed';
  /** Get not displayed reason */
  getNotDisplayedReason():
    | 'browser_not_supported'
    | 'invalid_client'
    | 'missing_client_id'
    | 'opt_out_or_no_session'
    | 'secure_http_required'
    | 'suppressed_by_user'
    | 'unregistered_origin'
    | 'unknown_reason';
}

/**
 * Revocation response
 */
interface RevocationResponse {
  /** Whether revocation was successful */
  successful: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Credential for storage
 */
interface Credential {
  /** Credential ID */
  id: string;
  /** Password (for password credentials) */
  password: string;
}

/**
 * Extend Window interface
 */
interface Window {
  google?: typeof google;
}
