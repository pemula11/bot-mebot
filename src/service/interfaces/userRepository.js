/**
 * UserRepository acts as a contract for user persistence.
 * Implementations must provide all methods below.
 */
class UserRepository {
  /**
   * @returns {Promise<object>} raw users map keyed by jid
   */
  async loadUserDB() { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @returns {Promise<object|null>} user data or null
   */
  async getUser(id) { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @param {object} data
   * @returns {Promise<void>}
   */
  async saveUser(id, data) { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @param {string} field
   * @param {any} value
   * @returns {Promise<void>}
   */
  async setUserField(id, field, value) { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @param {number} usage
   * @returns {Promise<void>}
   */
  async addUsageData(id, usage = 1) { throw new Error('Not implemented'); }
}

module.exports = UserRepository;


