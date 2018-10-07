'use strict'

const { RedisHelper } = use('App/Helpers')
const User = use('App/Models/User')
const Company = use('App/Models/Company')
const Dashboard = use('App/Models/Dashboard')
const Env = use('Env')

class DashboardController {
    async index({ response }) {
        const redisKey = 'Dashboard_Data'
        if(Env.get('REDIS_ENABLED',false)) {

            const cached = await RedisHelper.get(redisKey)
            if (cached) {
                return response.status(200).send(cached)
            }
        }
        const dashboard = await this.storeDashboardData()
        if(Env.get('REDIS_ENABLED',false)) {
            await RedisHelper.set(redisKey, dashboard)
        }
        return response.status(200).send(dashboard)
    }

    async store({ response }) {
        const dashboard = await this.storeDashboardData()
        return response.status(200).send(dashboard)
    }

    async storeDashboardData() {
      /*
      const totalMarketings = await User.query()
            .whereHas('roles', builder => {
                builder.where('slug', 'marketing')
            })
            .where('is_active', 1)
            .count('* as total')

        const totalProducts = await Product.query().count('* as total')
      */
        const totalCompanies = await Company.query().count('* as total')

        const dashboardDetails = {
            total_companies: totalCompanies[0].total
        }

        const dashboard = await Dashboard.first()
        dashboard.merge(dashboardDetails)
        await dashboard.save()
        if(Env.get('REDIS_ENABLED',false)) {
            const redisKey = 'Dashboard_Data'
            await RedisHelper.delete(redisKey)
        }

        return dashboard
    }
}

module.exports = DashboardController