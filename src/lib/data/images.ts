/**
 * Verified Unsplash photo IDs (checked for 200 response). Centralized so
 * broken IDs only need fixing in one place.
 */
function unsplash(id: string, w = 1200, q = 80) {
  return `https://images.unsplash.com/${id}?w=${w}&q=${q}&auto=format&fit=crop`;
}

export const IMG = {
  monsteraLeaf: unsplash("photo-1485955900006-10f4d324d411"),
  monsteraLeaves: unsplash("photo-1509423350716-97f9360b4e09"),
  succulentsTop: unsplash("photo-1462530260150-162092dbf011"),
  plantShelf: unsplash("photo-1416879595882-3373a0480b5b"),
  succulentHand: unsplash("photo-1493957988430-a5f2e15f39a3"),
  plantShop: unsplash("photo-1487958449943-2429e8be8625"),
  leafPattern: unsplash("photo-1463320726281-696a485928c7"),
  succulentClose: unsplash("photo-1524758631624-e2822e304c36"),
  greenery: unsplash("photo-1519378058457-4c29a0a2efac"),
  plantsRoom: unsplash("photo-1521334884684-d80222895322"),
  potStack: unsplash("photo-1512428813834-c702c7702b78"),
  gardenTools: "https://images.pexels.com/photos/6231726/pexels-photo-6231726.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80",
  whiteFlowerPlant: unsplash("photo-1525498128493-380d1990a112"),
  fernLeaves: unsplash("photo-1470058869958-2a77ade41c02"),
  plantWindow: unsplash("photo-1502394202744-021cfbb17454"),
  cactusPot: unsplash("photo-1466781783364-36c955e42a7f"),
  plantHands: unsplash("photo-1440342359743-84fcb8c21f21"),
  terrarium: "https://images.pexels.com/photos/31449564/pexels-photo-31449564.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80",
  plantsWindowsill: unsplash("photo-1607427293702-036933bbf746"),
  livingRoomPlants: unsplash("photo-1608889825205-eebdb9fc5806"),
  plantWatering: unsplash("photo-1587049352846-4a222e784d38"),
  potteryPlant: unsplash("photo-1459156212016-c812468e2115"),
  plantDetail: unsplash("photo-1526397751294-331021109fbd"),
  succulentArrangement: unsplash("photo-1509587584298-0f3b3a3a1797"),
  plantCloseup2: unsplash("photo-1622547748225-3fc4abd2cca0"),
  gardenBed: unsplash("photo-1560448205-4d9b3e6bb6db"),
  officePlants: unsplash("photo-1582131503261-fca1d1c0589f"),
  hangingPlant: unsplash("photo-1477414348463-c0eb7f1359b6"),
  forestGreen: unsplash("photo-1526047932273-341f2a7631f9"),
  plantNursery: unsplash("photo-1520412099551-62b6bafeb5bb"),
  cactusGarden: unsplash("photo-1444858291040-58f756a3bdd6"),
  balconyPlants: unsplash("photo-1611269154421-4e27233ac5c7"),
} as const;
