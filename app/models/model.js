const _ = require('lodash');
const uuid = require('uuid/v5');
const nconf = require('../../config/config');

class Model{


    constructor(modelEntity, session){

        this.labels = [];
        this.session = session;
        this.entity = modelEntity;
        this.uuidProp = '';
    }


    async add(objz){

        let obj = {};
        _.extend(obj, objz);

        if(this.uuidProp){
            let id = uuid(obj.prop[this.uuidProp], nconf.get('uuid-namespace'));
            obj.prop['id'] = id;
        }
        let queryString = 'CREATE (mod';
        let labelz = (obj.labels)?obj.labels:this.labels;
        let labelString = this._getLabelsString(labelz);
        let propertyString = this._getPropertyString(obj.prop);
        let toReturnString = (!obj.return)?'RETURN mod':'RETURN '+this._getPropAccessString(obj.return);

        queryString += `${labelString}${propertyString}) ${toReturnString}`;
        let result = await this.session.run(queryString, obj.prop);
        return new this.entity(result.records[0].get('mod'),  {takenFields: objz.takenFields});

    }

    async get(objz){
        objz.limit = 1;
        let result = await this._get(objz);
        if(result.records.length){
            return new this.entity(result.records[0].get('mod'), {takenFields: objz.takenFields});
        }
        return false;
    }

    async getAll(objz){

        let obj = (objz)?objz: {};
        let result = await this._get(obj);
        let res = result.records.map(r => {
            let rr = r.get('mod');
            return new this.entity({node:rr})
        });
        return res;
    }

    async delete(obj){
      
        let deleted = await this._delete(obj);
        return deleted;

    }

    async deleteOne(obj){
        obj.limit = 1;
        let deleted = await this._delete(obj);
        return deleted;
    }

  
    //{labels:['User'], prop:{username:'username'}, return:['name','email'], update:{'name':'newName'} }
    async update(objz){
       
        let obj = {};
        _.extend(obj, objz);

        let queryString = 'MATCH(mod';
        let labelz = (obj.labels)?obj.labels:this.labels;
        let labelString = this._getLabelsString(labelz);
        let propertyString = this._getPropertyString(obj.prop);
        let toReturnString = (!obj.return)?'RETURN mod':'RETURN '+this._getPropAccessString(obj.return);

        let setArray = [];
        let updateKeys = Object.keys(obj.update);
        let newUpdates = {};

       updateKeys.forEach(key => {

                let newKey = `new${key}`;
                setArray.push(`mod.${key} = {${newKey}}`);
                newUpdates[newKey] = obj.update[key];
       });

       let updateString = `SET ${setArray.join(', ')}`;
       queryString += `${labelString}${propertyString}) ${updateString} ${toReturnString}`;

       let myStuff = {};
       _.extend(myStuff, obj.prop, newUpdates);

       let result = await this.session.run(queryString, myStuff);

       if (_.isEmpty(result)) {
           return false;
       }
       return true;


    }
    
    async _delete(){
        let obj = {};
        _.extend(obj, objz);

        let queryString = 'MATCH(mod';
        let labelz = (obj.labels)?obj.labels:this.labels;
        let labelString = this._getLabelsString(labelz);
        let propertyString = this._getPropertyString(obj.prop);
        let limitString = (!obj.limit)?'':`LIMIT ${limit}`; //TODO: use limit string
        let deleteString = ' DELETE mod ';
        queryString += `${labelString}${propertyString}) ${deleteString} ${orderByString}`;
        
        let result = await this.session.run(queryString, obj.prop);
        if (_.isEmpty(result)) {
            return false;
        }
        return true;
    }
    //async get(properties, return, limit = null, offset = null, order = null, labels = null){
    _get(objz){
      
        let obj = {};
        _.extend(obj, objz);

        let queryString = 'MATCH(mod';
        let labelz = (obj.labels)?obj.labels:this.labels;
        let labelString = this._getLabelsString(labelz);
        let propertyString = (!obj.prop) ?"": this._getPropertyString(obj.prop);
        let toReturnString = (!obj.return)?'RETURN mod':'RETURN '+this._getPropAccessString(obj.return);
        let orderByString = (!obj.order)?'':`ORDER BY ${this._getPropAccessString(obj.order)}`;
        let skipString = (!obj.offset)?'':`SKIP ${obj.offset}`;
        let limitString = (!obj.limit)?'':`LIMIT ${obj.limit}`;
        queryString += `${labelString}${propertyString}) ${toReturnString} ${orderByString} ${skipString} ${limitString}`;
        if(obj.prop){
            return this.session.run(queryString, obj.prop); 
        }
        return this.session.run(queryString);
        
    }

    _getLabelsString(labels = []){
        let labelString = labels.join(':');
        labelString = `:${labelString}`;
        return labelString;
    }

    _getPropertyString(properties = {}){

        let propertyKeys = Object.keys(properties);
        let propertyString = '';
        let propParamStringArr = [];
        propertyKeys.forEach((key)=>{
            propParamStringArr.push(`${key}: {${key}}`);
        });
        propertyString = `{${propParamStringArr.join(', ')}}`;
        return propertyString;

    }

    _getPropAccessString(propAccess = []){
        
        let propAccessStringArr = [];
        let propAccessString = '';
        propAccess.forEach((value)=>{
            propAccessStringArr.push(`mod.${value}`);
        });

        propAccessString = propAccessStringArr.join(', ');
        return propAccessString;
    }

}

module.exports = Model;