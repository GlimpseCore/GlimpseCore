import { DataOperationType } from 'routes/requests/details/data/DataInterfaces';

export const redisCommandToNumberMap = {
    // CREATE
    geoadd: DataOperationType.Create,
    hmset: DataOperationType.Create,
    hset: DataOperationType.Create,
    hsetnx: DataOperationType.Create,
    linsert: DataOperationType.Create,
    lpush: DataOperationType.Create,
    lpushx: DataOperationType.Create,
    lset: DataOperationType.Create,
    mset: DataOperationType.Create,
    msetnx: DataOperationType.Create,
    pfadd: DataOperationType.Create,
    psetex: DataOperationType.Create,
    rpush: DataOperationType.Create,
    rpushx: DataOperationType.Create,
    sadd: DataOperationType.Create,
    set: DataOperationType.Create,
    setbit: DataOperationType.Create,
    setex: DataOperationType.Create,
    setnx: DataOperationType.Create,
    setrange: DataOperationType.Create,
    zadd: DataOperationType.Create,

    // READ
    bitcount: DataOperationType.Read,
    bitop: DataOperationType.Read,
    bitpos: DataOperationType.Read,
    dbsize: DataOperationType.Read,
    dump: DataOperationType.Read,
    echo: DataOperationType.Read,
    exists: DataOperationType.Read,
    geohash: DataOperationType.Read,
    geopos: DataOperationType.Read,
    geodist: DataOperationType.Read,
    georadius: DataOperationType.Read,
    georadiusbymember: DataOperationType.Read,
    get: DataOperationType.Read,
    getbit: DataOperationType.Read,
    getrange: DataOperationType.Read,
    getset: DataOperationType.Read,
    hexists: DataOperationType.Read,
    hget: DataOperationType.Read,
    hgetall: DataOperationType.Read,
    hkeys: DataOperationType.Read,
    hlen: DataOperationType.Read,
    hmget: DataOperationType.Read,
    hstrlen: DataOperationType.Read,
    hvals: DataOperationType.Read,
    keys: DataOperationType.Read,
    lastsave: DataOperationType.Read,
    llen: DataOperationType.Read,
    lindex: DataOperationType.Read,
    lrange: DataOperationType.Read,
    mget: DataOperationType.Read,
    pfcount: DataOperationType.Read,
    pttl: DataOperationType.Read,
    randomkey: DataOperationType.Read,
    scard: DataOperationType.Read,
    sdiff: DataOperationType.Read,
    sdiffstore: DataOperationType.Read,
    sinter: DataOperationType.Read,
    sinterstore: DataOperationType.Read,
    sismember: DataOperationType.Read,
    smembers: DataOperationType.Read,
    sort: DataOperationType.Read,
    srandmember: DataOperationType.Read,
    strlen: DataOperationType.Read,
    sunion: DataOperationType.Read,
    sunionstore: DataOperationType.Read,
    time: DataOperationType.Read,
    ttl: DataOperationType.Read,
    type: DataOperationType.Read,
    zcard: DataOperationType.Read,
    zcount: DataOperationType.Read,
    zinterstore: DataOperationType.Read,
    zlexcount: DataOperationType.Read,
    zrange: DataOperationType.Read,
    zrangebylex: DataOperationType.Read,
    zrevrangebylex: DataOperationType.Read,
    zrangebyscore: DataOperationType.Read,
    zrank: DataOperationType.Read,
    zrevrangebyscore: DataOperationType.Read,
    zrevrank: DataOperationType.Read,
    zrevrange: DataOperationType.Read,
    zscore: DataOperationType.Read,
    zunionstore: DataOperationType.Read,
    sscan: DataOperationType.Read,
    hscan: DataOperationType.Read,
    zscan: DataOperationType.Read,

    // UPDATE
    append: DataOperationType.Update,
    bitfield: DataOperationType.Update, // Update (?) It can also be create or read based on subcommand
    brpoplpush: DataOperationType.Update,
    decr: DataOperationType.Update,
    decrby: DataOperationType.Update,
    hincrby: DataOperationType.Update,
    hincrbyfloat: DataOperationType.Update,
    incr: DataOperationType.Update,
    incrby: DataOperationType.Update,
    incrbyfloat: DataOperationType.Update,
    pfmerge: DataOperationType.Update,
    rename: DataOperationType.Update,
    renamenx: DataOperationType.Update,
    smove: DataOperationType.Update,
    touch: DataOperationType.Update,
    zincrby: DataOperationType.Update,

    // DELETE
    blpop: DataOperationType.Delete,
    brpop: DataOperationType.Delete,
    del: DataOperationType.Delete,
    expire: DataOperationType.Delete,
    expireat: DataOperationType.Delete,
    flushall: DataOperationType.Delete,
    flushdb: DataOperationType.Delete,
    hdel: DataOperationType.Delete,
    lpop: DataOperationType.Delete,
    lrem: DataOperationType.Delete,
    ltrim: DataOperationType.Delete,
    pexpire: DataOperationType.Delete,
    pexpireat: DataOperationType.Delete,
    rpop: DataOperationType.Delete,
    rpoplpush: DataOperationType.Delete,
    spop: DataOperationType.Delete,
    srem: DataOperationType.Delete,
    unlink: DataOperationType.Delete,
    zrem: DataOperationType.Delete,
    zremrangebylex: DataOperationType.Delete,
    zremrangebyrank: DataOperationType.Delete,
    zremrangebyscore: DataOperationType.Delete
};

export const mapCommandToDataOperationType = (command: string): DataOperationType => {
    const fallback = DataOperationType.Other;

    // if command is falsy - return fallback value
    if (!command) {
        return fallback;
    }

    const number = redisCommandToNumberMap[command.toLowerCase().trim()];
    return number === undefined ? fallback : number;
};

/**
 * mapCommandToCrud - function to map a Redis `command` to a `CRUD` operation.
 *
 * @param {String} command Redis command.
 * @return {String} `CRUD` operation.
 */
export const mapCommandToCrud = (command: string): string => {
    return DataOperationType[mapCommandToDataOperationType(command)];
};



// WEBPACK FOOTER //
// ./src/client/routes/requests/details/data/RedisCommandToCrudMap.ts