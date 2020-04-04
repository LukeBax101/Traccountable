module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
    ? '/traccountable'
    : '/',
    css: {
      loaderOptions: {
        sass: {
          prependData: `
            @import "@/scss_variables.scss";
          `
        }
      }
    },
    pwa: {
    	name: 'Traccountable',
    	themeColor: '#4a91f2',
    	appleMobileWebAppCapable: 'yes',
    	appleMobileWebAppStatusBarStyle: 'black',
    	iconPaths: {
    	    favicon32: 'img/icons/ta-favicon-32x32.png',
    	    favicon16: 'img/icons/ta-favicon-16x16.png',
    	    appleTouchIcon: 'img/icons/ta-apple-touch-icon.png'
            },
    	manifestOptions: {
    	    short_name: 'TA',
    	    background_color: '#3b7dd8',
    	    icons: [
                    {
                        'src': 'img/icons/ta-android-chrome-192x192.png',
                        'sizes': '192x192',
                        'type': 'image/png',
                    },
                    {
                        'src': 'img/icons/ta-android-chrome-512x512.png',
                        'sizes': '512x512',
                        'type': 'image/png',
                    }
                ]
    	}
    },
    chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        args[0].title = 'Traccountable';
        return args;
      });
  }
};
