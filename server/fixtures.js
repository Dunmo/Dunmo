
if(Meteor.users.find().count() === 0) {

  var userId = Accounts.createUser({
    email: 'test@example.com',
    password: 'password',
    profile: {
      name: 'John Doe'
    }
  });
  console.log('creating user with id: ', userId);
  console.log('user: ', Meteor.users.findOne(userId));

}

var user = Meteor.users.findOne({ 'emails.address': 'test@example.com' });
var userId = user._id
if(Tasks.find({ ownerId: userId }).count() === 0) {

  function randItem (ary) {
    return ary[Math.floor(Math.random()*(ary.length-1))];
  }

  var fakeData = {
    title: ['Walk the dog', 'Water the plants', 'Write a love song', 'Homework'],
    importance: [0, 1, 2, 3],
    dueAt: [
      moment().add(1, 'days').toDate(),
      moment().add(2, 'days').toDate(),
      moment().add(3, 'days').toDate(),
      moment().add(4, 'days').toDate(),
    ],
    remaining: [30*MINUTES, 1*HOURS, 90*MINUTES, 2*HOURS, 150*MINUTES, 3*HOURS]
  }

  _.times(5, function createTask () {
    var taskId = Tasks.create({
      ownerId: userId,
      title: randItem(fakeData.title),
      importance: randItem(fakeData.importance),
      dueAt: randItem(fakeData.dueAt),
      remaining: randItem(fakeData.remaining)
    });
    console.log('creating a task with id: ', taskId);
    console.log('task: ', Tasks.findOne(taskId));
  });

}
