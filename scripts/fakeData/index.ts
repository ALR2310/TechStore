import { fakeReviews, fakeViewed } from './review';

(async () => {
  await fakeViewed();
  await fakeReviews();
})();
