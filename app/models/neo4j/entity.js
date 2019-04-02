var _ = require('lodash');
class Entity{
    
        constructor(modelProperties){
           
            let node = modelProperties.node;
            let numFields = modelProperties.numFields;
            let hiddenFields = modelProperties.hiddenFields || [];
            let takenFields = modelProperties.takenFields;
           
            let nodeProperties = node.properties;

            let newNodeProperties = {};
            if(takenFields){
                newNodeProperties = _.pick(nodeProperties, takenFields);
            }else{
                newNodeProperties = _.omit(nodeProperties, hiddenFields);
            }
            _.extend(this, newNodeProperties);
    
            if (numFields){
                this._setNumbers(numFields, node.properties);
            }
        }
    
        _setNumbers(numProp, gotProp){
            numProp.forEach(num => {
                let got = gotProp[num];
                if(got){
                    this[num] = got.toNumber();
                }
            });
        }
}

module.exports = Entity;