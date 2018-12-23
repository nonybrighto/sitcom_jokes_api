const _ = require('lodash');
const uuid = require('uuid/v5');
const nconf = require('../../config/config');

class GeneralHelper{


        generateUuid(property = '', addRandom = false){


            if(_.isEmpty(property)){
                property  = this.generateRandomStrings(8);
            }
            if(addRandom){
                property+this.generateRandomStrings(7);
            }

           let id =  uuid(property, nconf.get('uuid-namespace'));
           return id;
        }

        generateRandomStrings(length = 5){
                return Math.random().toString(36).slice(-length);
        }

}

module.exports = GeneralHelper;