var _ = require('lodash');
class Entity{
    
        constructor(_node, numFields = null, hiddenFields){
           let nodeProperties = _node.properties;

            var newNodeProperties = _.omit(nodeProperties, hiddenFields);
            _.extend(this, newNodeProperties);
    
            if (numFields){
                this._setNumbers(numFields, _node.properties);
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