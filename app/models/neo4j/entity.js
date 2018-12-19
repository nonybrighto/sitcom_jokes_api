var _ = require('lodash');
class Entity{
    
        constructor(_node, numFields = null){
            _.extend(this,  _node.properties);
    
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