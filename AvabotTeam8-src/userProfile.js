class UserProfile {
    constructor(transport, name, age, picture) {
        this.transport = transport;
        this.name = name;
        this.age = age;
        this.picture = picture;
    }
}

module.exports.UserProfile = UserProfile;