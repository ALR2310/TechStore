import { fakeReviews, fakeUsers, fakeViewed } from './review';

(async () => {
  await fakeUsers(10);
  await fakeViewed();
  await fakeReviews();
})();
