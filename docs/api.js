YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AppController",
        "AppRoute",
        "ApplicationAdapter",
        "ApplicationRoute",
        "GetDateHelper",
        "Initializer",
        "InjectRouterInitializer",
        "JavascriptBehaviorsInitializer",
        "MetadataUtil",
        "NotLastHelper",
        "OAuth2Authenticator",
        "OAuth2Authorizer",
        "Prometheus.AppWikiRoute",
        "Prometheus.NavBarComponent",
        "Prometheus.ProjectModel",
        "Prometheus.TokenModel",
        "Prometheus.UserModel",
        "Prometheus.app.module",
        "Prometheus.en",
        "Prometheus.nav-bar",
        "Routes",
        "SetupLoggerInitializer",
        "SigninController",
        "application"
    ],
    "modules": [
        "App.Components",
        "Application",
        "i18n"
    ],
    "allModules": [
        {
            "displayName": "App.Components",
            "name": "App.Components",
            "description": "This component is responsible for rendering the navigation bar in the application"
        },
        {
            "displayName": "Application",
            "name": "Application",
            "description": "This is the english language tranlations for the project. For now they are\nhard coded but in future we would want to load them from the server and\nwe would like to allow people to include their own translations.\n\nThis should also be possible for plugins to have their own translations.\n\nNeed to see if we can support rtl"
        },
        {
            "displayName": "i18n",
            "name": "i18n"
        }
    ],
    "elements": []
} };
});