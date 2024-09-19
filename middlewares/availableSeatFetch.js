const PostShareModel = require("../models/postShareSchema");

const availableSeatFetch = async (req, res, next) => {
  try {
    //all post share collection fetch korlam
    const postInfo = await PostShareModel.find({});

    let rangeTkAvailable = [0, 0, 0, 0, 0, 0];

    //available count kortesi j ei rent range a koyta seat available ase
    for (let i = 0; i < postInfo.length; i++) {
      if (postInfo[i].rent <= 1500) {
        rangeTkAvailable[0]++;
      } else if (postInfo[i].rent > 1500 && postInfo[i].rent <= 2000) {
        rangeTkAvailable[1]++;
      } else if (postInfo[i].rent > 2000 && postInfo[i].rent <= 2500) {
        rangeTkAvailable[2]++;
      } else if (postInfo[i].rent > 2500 && postInfo[i].rent <= 3000) {
        rangeTkAvailable[3]++;
      } else if (postInfo[i].rent > 3000 && postInfo[i].rent <= 3500) {
        rangeTkAvailable[4]++;
      } else {
        rangeTkAvailable[5]++;
      }
    }
    console.log(rangeTkAvailable);
    //array theke object a store korlam
    const obj = {
      r1: rangeTkAvailable[0],
      r2: rangeTkAvailable[1],
      r3: rangeTkAvailable[2],
      r4: rangeTkAvailable[3],
      r5: rangeTkAvailable[4],
      r6: rangeTkAvailable[5],
    };
    console.log(obj);

    //req a ei obj ta pathiye dilam, er vitor count gula ase
    req.availableSeatFetch = obj;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = availableSeatFetch;
