import keys from "./keys.js";

export default {
  development: {
    //url to be used in link generation
    //url: 'http://my.site.com',
    //mongodb connection settings

    dbURI: keys.DevMongodbURI,

    //server details
    server: {
      //host: '127.0.0.1',
      //port: '3422'
    },
  },
  production: {
    //url to be used in link generation
    //url: 'http://my.site.com',
    //mongodb connection settings
    dbURI: "",
    //server details
    server: {
      // host:   '127.0.0.1',
      //port:   '3421'
    },
  },
};
