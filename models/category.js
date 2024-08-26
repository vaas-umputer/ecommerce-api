const mongoose=require('mongoose')

const categorySchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    icon:{
        type:String,
        required:false,
        default:' '
    }
    },
    {
        timestamps:true
    }
)

module.exports=mongoose.model('Category',categorySchema);