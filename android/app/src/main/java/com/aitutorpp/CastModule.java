package com.aitutorpp;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.mediarouter.media.MediaRouteSelector;
import androidx.mediarouter.media.MediaRouter;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.cast.framework.CastContext;
import com.google.android.gms.cast.framework.CastSession;
import com.google.android.gms.cast.framework.SessionManager;
import com.google.android.gms.cast.framework.SessionManagerListener;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class CastModule extends ReactContextBaseJavaModule {
    private static final String TAG = "CastModule";
    private static final String MODULE_NAME = "CastModule";
    
    private final ReactApplicationContext reactContext;
    private CastContext castContext;
    private SessionManager sessionManager;
    private MediaRouter mediaRouter;
    private MediaRouteSelector mediaRouteSelector;
    private List<CastDevice> discoveredDevices = new ArrayList<>();
    private CastSession currentSession;
    private boolean isInitialized = false;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    
    private MediaRouter.Callback mediaRouterCallback;

    private final SessionManagerListener<CastSession> sessionManagerListener = new SessionManagerListener<CastSession>() {
        @Override
        public void onSessionStarted(@NonNull CastSession session, @NonNull String sessionId) {
            Log.d(TAG, "Session started: " + sessionId);
            currentSession = session;
            sendEvent("castSessionStarted", null);
        }

        @Override
        public void onSessionEnded(@NonNull CastSession session, int error) {
            Log.d(TAG, "Session ended");
            currentSession = null;
            sendEvent("castSessionEnded", null);
        }

        @Override
        public void onSessionResumed(@NonNull CastSession session, boolean wasSuspended) {
            Log.d(TAG, "Session resumed");
            currentSession = session;
        }

        @Override
        public void onSessionStarting(@NonNull CastSession session) {
            Log.d(TAG, "Session starting");
        }

        @Override
        public void onSessionStartFailed(@NonNull CastSession session, int error) {
            Log.e(TAG, "Session start failed: " + error);
            sendEvent("castSessionFailed", null);
        }

        @Override
        public void onSessionEnding(@NonNull CastSession session) {
            Log.d(TAG, "Session ending");
        }

        @Override
        public void onSessionResuming(@NonNull CastSession session, @NonNull String sessionId) {}

        @Override
        public void onSessionResumeFailed(@NonNull CastSession session, int error) {}

        @Override
        public void onSessionSuspended(@NonNull CastSession session, int reason) {}
    };

    public CastModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        // Initialize media router callback
        mediaRouterCallback = new MediaRouter.Callback() {
            @Override
            public void onRouteAdded(@NonNull MediaRouter router, @NonNull MediaRouter.RouteInfo route) {
                Log.d(TAG, "Route added: " + route.getName());
                if (route.getExtras() != null) {
                    CastDevice device = CastDevice.getFromBundle(route.getExtras());
                    if (device != null && !containsDevice(device.getDeviceId())) {
                        Log.d(TAG, "Cast device found: " + device.getFriendlyName());
                        discoveredDevices.add(device);
                        sendDeviceDiscovered(device);
                    }
                }
            }

            @Override
            public void onRouteRemoved(@NonNull MediaRouter router, @NonNull MediaRouter.RouteInfo route) {
                Log.d(TAG, "Route removed: " + route.getName());
                if (route.getExtras() != null) {
                    CastDevice device = CastDevice.getFromBundle(route.getExtras());
                    if (device != null) {
                        removeDevice(device.getDeviceId());
                    }
                }
            }

            @Override
            public void onRouteChanged(@NonNull MediaRouter router, @NonNull MediaRouter.RouteInfo route) {
                Log.d(TAG, "Route changed: " + route.getName());
            }
        };
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    private void initializeCastOnMainThread(final Promise promise) {
        mainHandler.post(() -> {
            try {
                Activity activity = getCurrentActivity();
                Context context = activity != null ? activity : reactContext;
                
                // Initialize Cast Context
                castContext = CastContext.getSharedInstance(context, Executors.newSingleThreadExecutor())
                        .getResult();
                
                if (castContext != null) {
                    sessionManager = castContext.getSessionManager();
                    sessionManager.addSessionManagerListener(sessionManagerListener, CastSession.class);
                }
                
                // Initialize MediaRouter
                mediaRouter = MediaRouter.getInstance(context);
                
                // Build selector for Cast devices
                mediaRouteSelector = new MediaRouteSelector.Builder()
                        .addControlCategory(CastMediaControlIntent.categoryForCast(CastOptionsProvider.RECEIVER_APP_ID))
                        .build();
                
                isInitialized = true;
                Log.d(TAG, "Cast initialized successfully");
                
                if (promise != null) {
                    promise.resolve(true);
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to initialize Cast: " + e.getMessage(), e);
                isInitialized = false;
                if (promise != null) {
                    promise.reject("INIT_ERROR", "Failed to initialize Cast: " + e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void initialize(Promise promise) {
        if (isInitialized) {
            promise.resolve(true);
            return;
        }
        initializeCastOnMainThread(promise);
    }

    @ReactMethod
    public void startDiscovery(Promise promise) {
        mainHandler.post(() -> {
            try {
                // Ensure initialization
                if (!isInitialized || mediaRouter == null || mediaRouteSelector == null) {
                    Activity activity = getCurrentActivity();
                    Context context = activity != null ? activity : reactContext;
                    
                    try {
                        castContext = CastContext.getSharedInstance(context, Executors.newSingleThreadExecutor())
                                .getResult();
                        if (castContext != null) {
                            sessionManager = castContext.getSessionManager();
                        }
                    } catch (Exception e) {
                        Log.w(TAG, "CastContext not available: " + e.getMessage());
                    }
                    
                    mediaRouter = MediaRouter.getInstance(context);
                    mediaRouteSelector = new MediaRouteSelector.Builder()
                            .addControlCategory(CastMediaControlIntent.categoryForCast(CastOptionsProvider.RECEIVER_APP_ID))
                            .build();
                    isInitialized = true;
                }
                
                discoveredDevices.clear();
                
                // Add callback for discovery
                mediaRouter.addCallback(mediaRouteSelector, mediaRouterCallback,
                        MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);
                
                Log.d(TAG, "Discovery started");
                promise.resolve(true);
                
            } catch (Exception e) {
                Log.e(TAG, "Discovery error: " + e.getMessage(), e);
                promise.reject("DISCOVERY_ERROR", e.getMessage());
            }
        });
    }

    @ReactMethod
    public void stopDiscovery(Promise promise) {
        mainHandler.post(() -> {
            try {
                if (mediaRouter != null && mediaRouterCallback != null) {
                    mediaRouter.removeCallback(mediaRouterCallback);
                }
                Log.d(TAG, "Discovery stopped");
                promise.resolve(true);
            } catch (Exception e) {
                Log.e(TAG, "Stop discovery error: " + e.getMessage());
                promise.reject("STOP_DISCOVERY_ERROR", e.getMessage());
            }
        });
    }

    @ReactMethod
    public void getDiscoveredDevices(Promise promise) {
        mainHandler.post(() -> {
            try {
                WritableArray devices = Arguments.createArray();
                
                if (mediaRouter == null) {
                    promise.resolve(devices);
                    return;
                }
                
                // Get all routes
                List<MediaRouter.RouteInfo> routes = mediaRouter.getRoutes();
                Log.d(TAG, "Found " + routes.size() + " routes");
                
                for (MediaRouter.RouteInfo route : routes) {
                    // Skip default route
                    if (route.isDefault()) continue;
                    
                    // Check if it's a Cast device
                    if (route.getExtras() != null) {
                        CastDevice device = CastDevice.getFromBundle(route.getExtras());
                        if (device != null) {
                            WritableMap deviceMap = Arguments.createMap();
                            deviceMap.putString("deviceId", device.getDeviceId());
                            deviceMap.putString("friendlyName", device.getFriendlyName());
                            deviceMap.putString("modelName", device.getModelName() != null ? device.getModelName() : "Cast Device");
                            devices.pushMap(deviceMap);
                            Log.d(TAG, "Found Cast device: " + device.getFriendlyName());
                        }
                    } else if (route.supportsControlCategory(CastMediaControlIntent.categoryForCast(CastOptionsProvider.RECEIVER_APP_ID))) {
                        // It's a Cast-compatible route even without extras
                        WritableMap deviceMap = Arguments.createMap();
                        deviceMap.putString("deviceId", route.getId());
                        deviceMap.putString("friendlyName", route.getName());
                        deviceMap.putString("modelName", route.getDescription() != null ? route.getDescription() : "Cast Device");
                        devices.pushMap(deviceMap);
                        Log.d(TAG, "Found Cast route: " + route.getName());
                    }
                }
                
                // Also add from discovered devices list
                for (CastDevice device : discoveredDevices) {
                    boolean exists = false;
                    for (int i = 0; i < devices.size(); i++) {
                        // Check if already added
                    }
                    if (!exists) {
                        WritableMap deviceMap = Arguments.createMap();
                        deviceMap.putString("deviceId", device.getDeviceId());
                        deviceMap.putString("friendlyName", device.getFriendlyName());
                        deviceMap.putString("modelName", device.getModelName() != null ? device.getModelName() : "Cast Device");
                        devices.pushMap(deviceMap);
                    }
                }
                
                promise.resolve(devices);
            } catch (Exception e) {
                Log.e(TAG, "Get devices error: " + e.getMessage(), e);
                promise.reject("GET_DEVICES_ERROR", e.getMessage());
            }
        });
    }

    @ReactMethod
    public void castToDevice(String deviceId, Promise promise) {
        mainHandler.post(() -> {
            try {
                if (mediaRouter == null) {
                    promise.reject("NOT_INITIALIZED", "MediaRouter not initialized");
                    return;
                }
                
                List<MediaRouter.RouteInfo> routes = mediaRouter.getRoutes();
                for (MediaRouter.RouteInfo route : routes) {
                    String routeId = route.getId();
                    CastDevice device = route.getExtras() != null ? 
                            CastDevice.getFromBundle(route.getExtras()) : null;
                    
                    if ((device != null && device.getDeviceId().equals(deviceId)) || 
                            routeId.equals(deviceId)) {
                        Log.d(TAG, "Selecting route: " + route.getName());
                        mediaRouter.selectRoute(route);
                        promise.resolve(true);
                        return;
                    }
                }
                promise.reject("DEVICE_NOT_FOUND", "Device not found: " + deviceId);
            } catch (Exception e) {
                Log.e(TAG, "Cast error: " + e.getMessage(), e);
                promise.reject("CAST_ERROR", e.getMessage());
            }
        });
    }

    @ReactMethod
    public void showCastDialog(Promise promise) {
        mainHandler.post(() -> {
            try {
                Activity activity = getCurrentActivity();
                if (activity == null) {
                    promise.reject("NO_ACTIVITY", "No activity available");
                    return;
                }
                
                // Ensure initialization
                if (mediaRouter == null) {
                    mediaRouter = MediaRouter.getInstance(activity);
                }
                if (mediaRouteSelector == null) {
                    mediaRouteSelector = new MediaRouteSelector.Builder()
                            .addControlCategory(CastMediaControlIntent.categoryForCast(CastOptionsProvider.RECEIVER_APP_ID))
                            .build();
                }
                
                // Show the native Cast dialog
                androidx.mediarouter.app.MediaRouteChooserDialog dialog = 
                        new androidx.mediarouter.app.MediaRouteChooserDialog(activity);
                dialog.setRouteSelector(mediaRouteSelector);
                dialog.show();
                
                Log.d(TAG, "Cast dialog shown");
                promise.resolve(true);
            } catch (Exception e) {
                Log.e(TAG, "Dialog error: " + e.getMessage(), e);
                promise.reject("DIALOG_ERROR", e.getMessage());
            }
        });
    }

    @ReactMethod
    public void endSession(Promise promise) {
        mainHandler.post(() -> {
            try {
                if (sessionManager != null) {
                    sessionManager.endCurrentSession(true);
                }
                if (mediaRouter != null) {
                    mediaRouter.unselect(MediaRouter.UNSELECT_REASON_STOPPED);
                }
                currentSession = null;
                Log.d(TAG, "Session ended");
                promise.resolve(true);
            } catch (Exception e) {
                Log.e(TAG, "End session error: " + e.getMessage());
                promise.reject("END_SESSION_ERROR", e.getMessage());
            }
        });
    }

    @ReactMethod
    public void isConnected(Promise promise) {
        try {
            boolean connected = currentSession != null && currentSession.isConnected();
            promise.resolve(connected);
        } catch (Exception e) {
            promise.reject("CHECK_CONNECTION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Required for RN event emitter
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Required for RN event emitter
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        } catch (Exception e) {
            Log.e(TAG, "Error sending event: " + e.getMessage());
        }
    }

    private void sendDeviceDiscovered(CastDevice device) {
        WritableMap params = Arguments.createMap();
        params.putString("deviceId", device.getDeviceId());
        params.putString("friendlyName", device.getFriendlyName());
        params.putString("modelName", device.getModelName() != null ? device.getModelName() : "Cast Device");
        sendEvent("castDeviceDiscovered", params);
    }

    private boolean containsDevice(String deviceId) {
        for (CastDevice device : discoveredDevices) {
            if (device.getDeviceId().equals(deviceId)) {
                return true;
            }
        }
        return false;
    }

    private void removeDevice(String deviceId) {
        discoveredDevices.removeIf(device -> device.getDeviceId().equals(deviceId));
    }
}
