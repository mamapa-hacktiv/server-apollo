export default {
  Users: [
    {
      username: "marsh",
      email: "marsh@potao.com",
      password: "123456",
      phoneNumber: "082135204098",
    },
    {
      username: "bunny",
      email: "test@gmail.com",
      password: "12345",
      phoneNumber: "082135204098",
    },
  ],
  Recipes: [
    {
      id: 1,
      title: "nasi goreng",
      image: "image.png",
      description:
        "Nasi goreng ayam suwir bisa membuat sarapanmu terasa istimewa. Sajikan dengan tambahan seperti telur mata sapi, acar mentimun, emping, dan sambal. Kita coba masak sendiri di rumah dengan resep ini, yuk! Nasi adalah salah satu makanan sisa yang banyak ditemukan di berbagai rumah tangga. Daripada dibuang langsung, membuat resep nasi goreng mudah ini sedikit banyak membantu kita menjaga bumi dan mengurangi food waste. Indonesia adalah negara kedua terbesar di dunia yang menyumbang food waste dan jumlahnya sangat besar. Sisa makanan berlebih ini sebetulnya bisa membantu kebutuhan pangan hingga 28 juta orang miskin di negeri ini! Nasi goreng dikenal sebagai menu mudah untuk dimasak. Bukan hanya bumbu, salah satu kunci kelezatan hidangan ini adalah tekstur nasi yang digunakan. Hidangan favorit ini cocoknya menggunakan nasi pera dan keras. Maka, dinginkan nasi putih di piring sekitar 30 menit sebelum mengolahnya. Untuk isian, kali ini kita menggunakan ayam suwir dan sosis. Tidak ada salahnya kamu menambahkan sayuran seperti wortel dan kacang polong ke dalam nasi goreng.",
      videoUrl: "video.youtube",
      origin: "boyolali, jawa tengah, indonesia",
      portion: 3,
      cookingTime: 1,
      UserId: 1,
    },
    {
      id: 2,
      title: "nasi bakar",
      image: "image.png",
      description:
        "Nasi bakar ayam rejeng bisa membuat sarapanmu terasa istimewa. Sajikan dengan tambahan seperti telur mata sapi, acar mentimun, emping, dan sambal. Kita coba masak sendiri di rumah dengan resep ini, yuk! Nasi adalah salah satu makanan sisa yang banyak ditemukan di berbagai rumah tangga. Daripada dibuang langsung, membuat resep nasi goreng mudah ini sedikit banyak membantu kita menjaga bumi dan mengurangi food waste. Indonesia adalah negara kedua terbesar di dunia yang menyumbang food waste dan jumlahnya sangat besar. Sisa makanan berlebih ini sebetulnya bisa membantu kebutuhan pangan hingga 28 juta orang miskin di negeri ini! Nasi goreng dikenal sebagai menu mudah untuk dimasak. Bukan hanya bumbu, salah satu kunci kelezatan hidangan ini adalah tekstur nasi yang digunakan. Hidangan favorit ini cocoknya menggunakan nasi pera dan keras. Maka, dinginkan nasi putih di piring sekitar 30 menit sebelum mengolahnya. Untuk isian, kali ini kita menggunakan ayam suwir dan sosis. Tidak ada salahnya kamu menambahkan sayuran seperti wortel dan kacang polong ke dalam nasi goreng.",
      videoUrl: "video.youtube",
      origin: "boyolali, jawa tengah, indonesia",
      portion: 3,
      cookingTime: 1,
      UserId: 2,
    },
  ],
  Comments: [
    {
      message: "Wah makanannya sangat biasa saja",
      RecipeId: 1,
      UserId: 1,
    },
    {
      message: "Wah makanannya sangat amazing",
      RecipeId: 2,
      UserId: 2,
    },
  ],

  Favorites: [
    {
      RecipeId: 1,
      UserId: 2,
    },
    {
      RecipeId: 2,
      UserId: 1,
    },
  ],
  Ingredients: [
    {
      name: "membuat nasi goreng",
      RecipeId: 2,
    },
    {
      name: "membuat nasi bakar tapi digoreng",
      RecipeId: 2,
    },
  ],
  Steps: [
    {
      instruction: "Step setep membuat nasgor",
      image: "ini foto testing",
      RecipeId: 2,
    },
    {
      instruction: "Step setep membuat nasi bakar digoreng",
      image: "ini foto testing",
      RecipeId: 1,
    },
  ],
  Reactions: [
    {
      emoji: "ini emojii",
      quantity: 2,
      RecipeId: 2,
      UserId: 1,
    },
    {
      emoji: "Step setep membuat nasgor",
      quantity: 1,
      RecipeId: 2,
      UserId: 1,
    },
  ],
};
