const _ = require('lodash');
const uuid = require('uuid/v5');
const nconf = require('../../config/config');
const Pagination = require('../helpers/pagination');
const ApiError = require('../helpers/api_error');
const httpStatus = require('http-status');

class GeneralHelper{


        generateUuid(property = '', addRandom = false){


            if(_.isEmpty(property)){
                property  = this.generateRandomStrings(8);
            }
            if(addRandom){
                property+=this.generateRandomStrings(7);
            }

           let id =  uuid(property, nconf.get('uuid-namespace'));
           return id;
        }

        generateRandomStrings(length = 5){
                return Math.random().toString(36).slice(-length);
        }


        async buildMultiItemResponse(req,res, next, {itemCount, errorMessage, url, getItems: getItems}){

            try{
                let page = req.query.page;
                let perPage = req.query.perPage;
                let pagination = new Pagination(url || 'url', itemCount, page, perPage);
                let gottenItems = await getItems(pagination.getOffset(), perPage);
                return res.status(httpStatus.OK).send({...pagination.generatePaginationObject(), results: gottenItems});

            }catch(error){
                return next(new ApiError( errorMessage || 'Internal error occured while getting items', true));
            }

        }

}

module.exports = GeneralHelper;