// 36 deterministic mock profiles. `likedUser` is SERVER-ONLY seed data meaning
// "this profile already liked the logged-in user". It is never sent to the client.
const names = ["Aarav","Ananya","Vihaan","Diya","Kabir","Meera","Reyansh","Isha","Arjun","Saanvi","Rohan","Kiara",
  "Dev","Anika","Ishaan","Myra","Aditya","Tara","Krish","Riya","Neil","Zoya","Yash","Navya","Samar","Pooja",
  "Rahul","Sneha","Karan","Ira","Veer","Nisha","Ayaan","Pari","Manav","Aisha"];
const places = ["IIT Delhi","DU North Campus","Bangalore","Mumbai","BITS Pilani","Pune","Hyderabad","Jaipur","Chandigarh","NIT Trichy","Kolkata","Goa"];
const pool = ["Travel","Coffee","Gym","Anime","Football","Poetry","Cooking","Photography","Gaming","Music","Hiking","Movies","Startups","Dance","Books","Cricket"];
const bios = [
  "Will rate your playlist honestly.","Chai over coffee, always.","Looking for someone to split fries with.",
  "Weekend trekker, weekday overthinker.","Ask me about my houseplants.","Professional late-night snacker.",
  "Probably reading in a cafe right now.","Can beat you at carrom.","Here for good conversations and better memes.",
  "Mountains > beaches. Fight me.","Learning guitar, badly but happily.","Will travel for biryani."];

export const CURRENT_USER = { id: "me", name: "You" };

export const profiles = names.map((name, i) => ({
  id: `p${i + 1}`,
  name,
  age: 19 + ((i * 7) % 11),
  photo: `https://picsum.photos/seed/coy-${i + 1}/600/800`,
  bio: bios[i % bios.length],
  city: places[i % places.length],
  interests: [0, 1, 2].map((k) => pool[(i * 3 + k * 5) % pool.length]),
  likedUser: i % 4 === 0, // 9 of 36 profiles already liked the user
}));
