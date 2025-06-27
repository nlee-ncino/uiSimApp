import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'
import App from './App.vue'

// Import Bootstrap and BootstrapVue CSS files
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)

// Create a simple logger plugin
const LoggerPlugin = {
    install(Vue, options = {}) {
        // Default log level
        const logLevel = options.logLevel || 'debug';
        const levels = ['debug', 'info', 'warn', 'error'];
        const levelIndex = levels.indexOf(logLevel);

        // Create logger object
        const logger = {};

        // Define log methods for each level
        levels.forEach((level, index) => {
            logger[level] = (...args) => {
                if (index >= levelIndex) {
                    console[level](`[${level.toUpperCase()}]`, ...args);
                }
            };
        });

        // Add to Vue prototype so it's accessible in components
        Vue.prototype.$log = logger;

        // Also make it available globally
        Vue.logger = logger;
    }
};

// Install the logger plugin
Vue.use(LoggerPlugin, {logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'});


// Disable production tip when in production
Vue.config.productionTip = false

// Create the Vue instance
new Vue({
    render: h => h(App)
}).$mount('#app')