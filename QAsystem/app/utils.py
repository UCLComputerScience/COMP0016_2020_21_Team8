import re


# Get the answers
def get_answers(results: dict, details: str = "all"):
    answers = results["answers"]
    # pp = pprint.PrettyPrinter(indent=4)
    if details != "all":
        if details == "minimal":
            keys_to_keep = set(["answer", "context"])
        elif details == "medium":
            keys_to_keep = set(["answer", "context", "score"])
        else:
            keys_to_keep = answers.keys()

        # filter the results
        filtered_answers = []
        for ans in answers:
            filtered_answers.append({k: ans[k] for k in keys_to_keep})
        # pp.pprint(filtered_answers)
        return filtered_answers
    else:
        return results

# Keep only the full sentences


def truncate(res: str):
    return re.search("[.?!,](.*)[.?!,]", res).group()
