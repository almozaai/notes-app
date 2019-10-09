const Sequelize = require('sequelize');
const { STRING, UUID, UUIDV4 } = Sequelize;

const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/my_db');

const User = conn.define('user', {
    id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true
    },
    fullName: STRING
});

const Note = conn.define('notes', {
    id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true
    },
    text: STRING,
    userId: {
        type: UUID,
        allowNull: false
    }
  },  {
        hooks: {
            beforeCreate: async function(note){
                const count = (await Note.findAll({ where: { userId: note.userId} })).length;
                if(count >= 5){
                    throw ({ message: 'this user already has 5 notes' })
                }
            }
        }
})

Note.belongsTo(User);

const syncAndSeed = async() => {
    await conn.sync({ force: true });
    const users = [
        { fullName: 'moe green' },
        { fullName: 'saleh saeed' },
        { fullName: 'ammar alkhaldi' },
    ];
    const [moe, lucy] = await Promise.all(users.map(user => User.create(user)));
};

module.exports ={
    syncAndSeed,
    models: {
        Note,
        User
    }
}
