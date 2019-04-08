var _ = require('lodash');
class Entity{
    

        constructor({modelProperties = null, numFields = null, hiddenFields = null, takenFields = null }){
           
            let nodeProperties = (this.isNode(modelProperties))? modelProperties.properties : modelProperties;

            if(takenFields){
                nodeProperties = _.pick(nodeProperties, takenFields);
            }else if(hiddenFields){
                nodeProperties = _.omit(nodeProperties, hiddenFields);
            }
            _.extend(this, nodeProperties);
    
            if (numFields){
                //this._setNumbers(numFields, node.properties);
                this._modifyNumberFields(numFields);
            }
        }
    
        _modifyNumberFields(numFields){
            numFields.forEach(numField => {
               // let got = gotProp[num];
                if(this[numField]){
                    this[numField] = this[numField].toNumber();
                }
            });
        }


        isNode(modelProperties){
                return modelProperties.properties && modelProperties.labels
        }
}

module.exports = Entity;