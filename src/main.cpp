#include <string>

#include <SparkWeaverCore.h>
#include <emscripten/bind.h>

struct NodeParamBindable {
    std::string name;
    uint16_t    min{};
    uint16_t    max{};
    uint16_t    default_value{};
};

struct NodeConfigBindable {
    std::string                    name;
    std::vector<NodeParamBindable> params{};
    uint8_t                        type_id{};
    uint8_t                        params_count{};
    uint8_t                        color_inputs_max{};
    uint8_t                        trigger_inputs_max{};
    bool                           color_outputs{};
    bool                           trigger_outputs{};
};

static SparkWeaverCore::Engine engine;

std::vector<NodeConfigBindable> getNodeConfigs()
{
    std::vector<NodeConfigBindable> configs;
    for (const auto& config : SparkWeaverCore::Engine::getNodeConfigs()) {
        std::vector<NodeParamBindable> params;
        for (const auto& param : config->params) {
            params.push_back({std::string(param.name.data()), param.min, param.max, param.default_value});
        }

        configs.push_back(
        {
            std::string(config->name.data()),
            std::move(params),
            config->type_id,
            config->params_count,
            config->color_inputs_max, config->trigger_inputs_max,
            config->color_outputs == SparkWeaverCore::ColorOutputs::ENABLED,
            config->trigger_outputs == SparkWeaverCore::TriggerOutputs::ENABLED});
    }
    return configs;
}

std::string build(const std::vector<uint8_t>& tree)
{
    try {
        engine.build(tree);
        return "OK";
    } catch (const std::exception& e) {
        return e.what();
    } catch (...) {
        return "Unknown error";
    }
}

emscripten::val tick()
{
    const auto p_data = engine.tick();
    return emscripten::val(emscripten::typed_memory_view(513, p_data));
}

std::vector<uint8_t> listExternalTriggers()
{
    return engine.listExternalTriggers();
}

void triggerExternalTrigger(const uint8_t id)
{
    engine.triggerExternalTrigger(id);
}

EMSCRIPTEN_BINDINGS(node_config)
{
    emscripten::value_object<NodeParamBindable>("NodeParamBindable")
        .field("name", &NodeParamBindable::name)
        .field("min", &NodeParamBindable::min)
        .field("max", &NodeParamBindable::max)
        .field("default_value", &NodeParamBindable::default_value);
    emscripten::register_vector<NodeParamBindable>("NodeParamVector");

    emscripten::value_object<NodeConfigBindable>("NodeConfigBindable")
        .field("type_id", &NodeConfigBindable::type_id)
        .field("name", &NodeConfigBindable::name)
        .field("params", &NodeConfigBindable::params)
        .field("params_count", &NodeConfigBindable::params_count)
        .field("color_inputs_max", &NodeConfigBindable::color_inputs_max)
        .field("trigger_inputs_max", &NodeConfigBindable::trigger_inputs_max)
        .field("color_outputs", &NodeConfigBindable::color_outputs)
        .field("trigger_outputs", &NodeConfigBindable::trigger_outputs);
    emscripten::register_vector<NodeConfigBindable>("NodeConfigVector");

    emscripten::function("getNodeConfigs", &getNodeConfigs);
    emscripten::function("build", &build);
    emscripten::register_vector<uint8_t>("VectorUint8");
    emscripten::function("tick", &tick);
    emscripten::function("listExternalTriggers", &listExternalTriggers);
    emscripten::function("triggerExternalTrigger", &triggerExternalTrigger);
}
