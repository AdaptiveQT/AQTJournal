interface FacebookLoginStatus {
    status: 'connected' | 'not_authorized' | 'unknown';
    authResponse: {
        accessToken: string;
        expiresIn: string;
        signedRequest: string;
        userID: string;
    };
}

interface FacebookAppEvents {
    logPageView: () => void;
}

interface FacebookStatic {
    init: (params: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
    }) => void;
    AppEvents: FacebookAppEvents;
    getLoginStatus: (callback: (response: FacebookLoginStatus) => void) => void;
}

interface Window {
    fbAsyncInit: () => void;
    FB: FacebookStatic;
}
