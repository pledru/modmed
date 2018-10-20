const assert = require('chai').assert;
const EventTypeService = require('../../../src/database/services/eventTypeService')

async function test() {
  const eventTypeService = new EventTypeService()
  let types = [
    { id: 1, 
      description: 'Did you eat 5 different vegetables or fruits?', 
      score: 1 
    },
    { id: 2, 
      description: 'Did you eat 3 servings of healthy fats (e.g., olive oil, nuts, avocado)?', 
      score: 1 
    },
    { id: 3, 
      description: 'Did you eat sugar or refined carbohydrate?', 
      score: -1 
    },
    { id: 4, 
      description: 'Did you eat or drink anything fermented (e.g., yogurt, kefir, kimchi, etc.)?',
      score: 1 
    },
    { id: 5, 
      description: 'Did you drink at least 8 cups of water?', 
      score: 1 
    },
    { id: 6, 
      description: 'Did you eat a serving of legumes (e.g. beans, lentils, chickpeas, hummus, edamame, etc.)?', 
      score: 1 
    },
    { id: 7, 
      description: 'Did you eat any deep-fried food?', 
      score: -1 
    },
    { id: 8, 
      description: 'Did you eat highly processed food?', 
      score: 1 
    },
    { id: 9, 
      description: 'Did you eat protein at every meal?', 
      score: 1 
    },
    { id: 10, 
      description: 'Did you prepare at least one dish from scratch?', 
      score: 1 
    },
    { id: 11, 
      description: 'Did you eat at least one mindful meal (e.g., *only* eating, not working, driving, watching TV at the same time)?', 
      score: 1 
    },
    { id: 12, 
      description: 'Did you spend 12 hours *not* eating overnight?', 
      score: 1 
    },
  ]
  let p

  p = eventTypeService.createTable()
  await p

  for (let i = 0; i < types.length; i++) {
    p = eventTypeService.add(types[i])
    await p
    p.then(data => { console.log(data) } ).catch(error => console.log(error))
  }

  p = eventTypeService.list()
  await p
  p.then(data => {
    assert.equal(data.Items.length, 12);
    data.Items.forEach(element => console.log(element))
  }).catch(error => console.log(error))

  p = eventTypeService.deleteTable()
  await p
}

test()

