require('dotenv').config()
const mongoose = require('mongoose')
const Menu = require('../model/menuSchema')

const courtFilter = {
    DishName: { $regex: 'court', $options: 'i' },
    Price: { $in: [2500, '2500'] }
}

async function main() {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured in .env')
    await mongoose.connect(process.env.MONGODB_URI)

    const courtMatches = await Menu.find(courtFilter)
        .select('_id DishName Price IsAvailable IsDeleted')
        .lean()
    const legacyFilter = {
        IsAvailable: { $exists: false },
        IsDeleted: { $ne: true },
        $nor: [courtFilter]
    }
    const legacyMatches = await Menu.find(legacyFilter)
        .select('_id DishName Price IsAvailable IsDeleted')
        .sort({ DishName: 1 })
        .lean()

    console.log('\nMenu visibility cleanup preview')
    console.log('Court-like item(s) at ETB 2,500 to hide:', courtMatches.length)
    courtMatches.forEach((item) => console.log(`- ${item.DishName} | ETB ${item.Price} | ${item._id}`))
    console.log('\nLegacy records without IsAvailable (will be kept active for backward compatibility):', legacyMatches.length)
    legacyMatches.forEach((item) => console.log(`- ${item.DishName} | ETB ${item.Price} | ${item._id}`))

    if (!process.argv.includes('--apply')) {
        console.log('\nDRY RUN ONLY: No database records were changed.')
        console.log('Review the list above. Run with --apply to apply the listed changes.')
        return
    }

    const now = new Date()
    const hidden = await Menu.updateMany(courtFilter, {
        $set: { IsAvailable: false, IsDeleted: true, deletedAt: now }
    })
    const migrated = await Menu.updateMany(legacyFilter, {
        $set: { IsAvailable: true, IsDeleted: false, deletedAt: null }
    })

    console.log('\nApplied successfully:')
    console.log(`- Court-like ETB 2,500 record(s) hidden: ${hidden.modifiedCount}`)
    console.log(`- Legacy menu record(s) explicitly marked available: ${migrated.modifiedCount}`)
    console.log('The public menu endpoint will now return only IsAvailable=true and not-deleted records.')
}

main()
    .catch((error) => {
        console.error('Menu cleanup failed:', error.message)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.disconnect().catch(() => {})
    })
